# Guía: probar el manejo de errores

Cómo comprobar que `AllExceptionsFilter` intercepta **todo** lo que no es una
excepción de dominio —TypeORM, el driver de Postgres, la red, un bug de
JavaScript— y deja el error íntegro en la consola sin filtrar nada al cliente.

---

## 1. Qué hace el filtro

Cuatro caminos, según de dónde venga la excepción:

| Excepción | Al cliente | A la consola |
|---|---|---|
| `DomainException` | código y estado del catálogo | `warn` de una línea con el `detail` |
| `HttpException` **401** | su propio estado, código `1001` | `warn` con el payload de Nest |
| `HttpException` **404** | su propio estado, código `2000` | `warn` con el payload de Nest |
| `HttpException` **4xx** | su propio estado, código `1000` | `warn` con el payload de Nest |
| `HttpException` **5xx** | su propio estado, código `1000` | `error` con el **objeto completo** |
| **Todo lo demás** | `500` / `9999` genérico | `error` con el **objeto completo** |

El filtro es **global** (`APP_FILTER` en `AppModule`), igual que
`ResponseInterceptor` (`APP_INTERCEPTOR`). No hay que acordarse de decorar cada
controller, y también quedan cubiertas las rutas que no existen: por eso el 404
tiene su propia entrada.

El volcado sale de `util.inspect(exception, { depth: 5 })`: el stack y, en el
caso de TypeORM, también `query`, `parameters` y el `driverError` con su
SQLSTATE, tabla y restricción.

La distinción entre 4xx y 5xx del framework importa: un 400 o un 403 es un
rechazo deliberado de un guard o un pipe y el payload de Nest ya lo dice todo,
pero un `InternalServerErrorException` es un fallo nuestro y sin stack no hay
forma de ubicarlo.

### El identificador de la petición

`requestIdMiddleware` corre antes que todo lo demás (`app.use` en `main.ts`) y
le asigna un identificador a **cada** petición, termine bien o mal:

- Si el cliente mandó `X-Request-Id` y supera la validación, se respeta.
- Si no, se genera uno de 12 caracteres hexadecimales.
- Siempre se devuelve en el header `X-Request-Id`, también en las respuestas
  exitosas.

El filtro ya no lo fabrica: lo lee de `req.requestId`, así que el `traceId` del
cuerpo y el header de la respuesta son el mismo valor.

Y va en el cuerpo de **toda** respuesta, no solo en las de error:
`ResponseInterceptor` lo añade también al sobre de éxito. Un "esto se guardó
mal" que no produjo ningún error sigue teniendo así por dónde buscarse en el
log.

### Lo que falla fuera de una petición

Un error solo llega a `AllExceptionsFilter` si sube por el ciclo HTTP. Lo que
ocurre en un handler de eventos, dentro de un `catch` que devuelve `null`, o
después de responder, no pasa por ahí. Esos sitios registran su propia línea:

| Dónde | Nivel | Qué deja escrito |
|---|---|---|
| `EventEmitterPublisher` | `error` | el evento que no se pudo procesar, con su payload |
| `StockMovementHandlers` | `error` | `[AUDITORIA INCOMPLETA]` con los movimientos que faltaron |
| `JwtAuthGuard` | `debug` | por qué se rechazó de verdad el token |
| Adaptadores de auth | `debug` | por qué se respondió "no existe" |
| `Argon2PasswordVerifier` | `debug` | que el hash guardado es ilegible |
| `main.ts` | `fatal` | excepciones y promesas sin manejar, antes de salir |

Las líneas en `debug` son pistas, no incidencias: al cliente se le sigue
respondiendo lo mismo de siempre —"credenciales inválidas", "no existe"— porque
distinguir los casos hacia fuera le regala información a quien esté probando.
Para verlas hace falta `LOG_LEVEL=debug`, que es el valor por defecto en
desarrollo.

**Un evento que falla ya no tumba la petición.** Cuando el publicador corre, la
operación de negocio ya se guardó: el stock movido, el usuario creado. Antes el
error subía y la petición respondía 500 por algo que sí había ocurrido, así que
quien reintentaba lo hacía dos veces. Ahora cada evento se emite por separado
—uno roto no cancela a los siguientes—, el fallo queda registrado con su payload
y la respuesta sigue siendo la que corresponde al hecho ya persistido. La
constancia en el log es lo que permite rehacer a mano lo que quedó a medias, y
por eso esas líneas deberían estar conectadas a alertas.

### Las consultas a la base

Salen por pino, con el `traceId` de la petición que las disparó:

```
[10:11:52.019] DEBUG: (d6f7c5ab48c3) [TypeORM] SELECT "TenantEntity"."tenant_id" ...
    parameters: [ "mi-negocio", false ]
[10:11:52.161] WARN: (d6f7c5ab48c3) POST /auth/login -> 401 | 148 ms
```

Antes iban por su cuenta a la consola —sin timestamp, sin nivel y sin
identificador—, así que quedaban sueltas entre las líneas de la petición y no
se sabía cuál venía de cuál.

Hay **dos palancas** y cada una hace algo distinto:

| Variable | Qué decide |
|---|---|
| `DB_LOGGING` | si TypeORM **emite** las consultas normales |
| `LOG_LEVEL` | si se **ven** (van en `debug`, así que `info` las esconde) |

Las consultas que **fallan** se registran siempre, aunque `DB_LOGGING` esté en
`false`: si una revienta dentro de un handler de eventos o de un `catch` que se
la traga, esa línea es la única constancia de que ocurrió. En una petición HTTP
se verá dos veces —aquí en el instante exacto, y al final en el filtro con el
volcado completo—, y las une el `traceId`.

`logging` ya no se le pasa a TypeORM: con un logger propio, TypeORM llama a sus
métodos siempre y no consulta esa opción, así que dejarla ahí haría creer que
apaga algo. El valor se le pasa al logger, que es quien decide.

### Qué queda registrado de cada petición

La línea que cierra la petición lleva, además del `traceId`:

| Campo | De dónde sale |
|---|---|
| `req.method`, `req.url`, `res.statusCode`, `responseTime` | la petición |
| `req.headers` | los headers tal cual, con los sensibles tapados |
| `body` | el cuerpo con el que llegó, con los sensibles tapados |
| `tenantId`, `userId`, `branchId`, `rolScope` | el token que validó `JwtAuthGuard` |

El usuario y el cuerpo se añaden **al cerrar** la petición (`customSuccessObject`
/ `customErrorObject` en `logger.config.ts`) y no en el serializador: `pino-http`
serializa el request al entrar, cuando Express todavía no parseó el cuerpo ni el
guard resolvió el usuario. Puesto ahí, el cuerpo salía siempre vacío.

En la consola de desarrollo se ocultan `req`, `res` y `responseTime` —el mensaje
ya dice método, ruta, estado y duración— pero el `body` sí se muestra. En
producción sale todo, que es donde se indexa.

> **Añadir un campo sensible a un DTO obliga a tocar `REDACTED_PATHS`.**
> El cuerpo se registra entero salvo lo que esa lista tapa: hoy `password`,
> `refreshToken` y `accessToken`, más los headers `authorization` y `cookie`.
> Lo que no esté ahí acaba escrito en claro. Hay pruebas que lo comprueban
> contra un pino real en `logger.config.spec.ts`.
>
> El cuerpo también puede llevar datos personales (un correo, un nombre). Es el
> precio de poder reproducir un fallo tal como llegó.

Se acepta el del cliente a propósito: así el front conserva la referencia
aunque la petición nunca llegue al servidor —timeout, red caída—, que es justo
cuando más falta hace. Y se puede aceptar sin riesgo porque el identificador
**no es una frontera de seguridad**: no autentica, no autoriza y no identifica
a nadie. Quien lo manipule solo ensucia la correlación de sus propias
peticiones.

La validación es `/^[A-Za-z0-9-]{8,64}$/`. Node ya rechaza en el parser los
saltos de línea y los caracteres de control dentro de un header —así que no se
puede inyectar una línea falsa en el log— y corta los headers gigantes con un
431. Lo que el patrón cierra es lo que sí pasaría: texto plano que imite el
formato del log y confunda un grep, y datos personales colados ahí por
descuido.

### Cómo lo lee el front

```ts
// Del header, en éxito y en error
const res = await fetch('/user');
const traceId = res.headers.get('X-Request-Id');
```

Para que eso funcione en el navegador, `X-Request-Id` está en las **dos** listas
de `cors.factory.ts`: en `allowedHeaders` para que el front pueda enviarlo, y en
`exposedHeaders` para que pueda leerlo. Sin lo segundo, `headers.get(...)`
devuelve `null` sin ningún error, y funciona bien en Postman y en `curl -i`, que
no aplican CORS.

Lo más robusto es que el front genere el suyo y lo mande:

```ts
api.interceptors.request.use((config) => {
    config.headers['X-Request-Id'] = crypto.randomUUID().slice(0, 12);
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Siempre lo hay: lo generó el propio front antes de salir.
        const traceId = error.config?.headers?.['X-Request-Id'];
        toast.error(`${error.response?.data?.message ?? 'Error de conexión'} (ref: ${traceId})`);
        return Promise.reject(error);
    },
);
```

Así el front tiene la referencia incluso si la petición nunca salió. Si llegó,
la encuentras en los logs con ese mismo identificador; si no la encuentras, ese
hecho ya te dice dónde está el problema.

### Qué queda registrado, por familia

Salida real del filtro:

```
JS · TypeError                    │ error (volcado) │ stack: SI │ 10 lineas
JS · RangeError                   │ error (volcado) │ stack: SI │ 10 lineas
JS · ReferenceError               │ error (volcado) │ stack: SI │ 10 lineas
JS · SyntaxError                  │ error (volcado) │ stack: SI │ 11 lineas
Node · ENOENT (fs real)           │ error (volcado) │ stack: SI │ 17 lineas
Node · ECONNREFUSED               │ error (volcado) │ stack: SI │ 15 lineas
TypeORM · QueryFailedError        │ error (volcado) │ stack: SI │ 29 lineas
Nest · BadRequestException (400)  │ warn  (1 linea) │ stack: NO │  1 lineas
Nest · ForbiddenException (403)   │ warn  (1 linea) │ stack: NO │  1 lineas
Nest · NotFoundException (404)    │ warn  (1 linea) │ stack: NO │  1 lineas
Nest · InternalServerError (500)  │ error (volcado) │ stack: SI │ 14 lineas
Nest · HttpException 502          │ error (volcado) │ stack: SI │ 14 lineas
lanzaron un string                │ error (volcado) │ stack: NO │  2 lineas
```

### Lo que un filtro no puede cubrir

Un `ExceptionFilter` solo ve lo que ocurre **dentro del ciclo de una petición**.
Quedan fuera los errores de arranque (una dependencia mal inyectada, la conexión
inicial a Postgres) y los `unhandledRejection` / `uncaughtException` de código
asíncrono suelto. Esos se cubren en `main.ts` con `process.on(...)`.

---

## 2. Ejecutar las pruebas

```bash
# Todo el manejo de errores (52 casos: filtro + middleware)
npx jest src/infrastructure/http --verbose

# Solo el filtro (28 casos)
npx jest src/infrastructure/http/all-exceptions.filter.spec.ts --verbose

# Solo el identificador de petición (24 casos)
npx jest src/infrastructure/http/request-id.middleware.spec.ts --verbose

# Un caso puntual, por nombre
npx jest src/infrastructure/http -t "driverError"

# Punta a punta (19 casos, otra configuración de jest)
npx jest --config ./test/jest-e2e.json test/error-handling.e2e-spec.ts --verbose

# Todas las del proyecto
npm test
```

> **Nota:** `test/app.e2e-spec.ts` falla hoy por un motivo ajeno a esto: importa
> `AppModule`, que arrastra el barrel `@/shared`, que importa `uuid@14` (ESM
> puro) y Jest no lo puede parsear en CommonJS. Ver la sección 6.

---

## 3. Fabricar el error sin base de datos

No hace falta una base caída ni una tabla duplicada: los errores que interesan
son objetos con una forma conocida y se construyen a mano.

```ts
// Un fallo de query tal como lo envuelve TypeORM. El error crudo del driver
// `pg` queda en `driverError`, con el SQLSTATE en `code`.
new QueryFailedError(
    'INSERT INTO users(email) VALUES ($1)',   // query
    ['ana@komi.com'],                          // parameters
    Object.assign(new Error('duplicate key value violates unique constraint'), {
        name: 'DatabaseError',
        severity: 'ERROR',
        code: '23505',
        table: 'users',
        constraint: 'uq_users_email',
        detail: 'Key (email)=(ana@komi.com) already exists.',
    }),
);

// Un fallo de red del runtime de Node
Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
    code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 5432,
});

// Una regla de negocio: DomainException es abstracta, la prueba declara su subclase
class ItemAlreadyExistsExceptionStub extends DomainException {
    constructor() {
        super({ code: '1302', detail: 'El item "Harina" ya existe en el tenant 42.' });
    };
};
```

Para el filtro hace falta un `ArgumentsHost`, que en la prueba son veinte líneas
que capturan qué status y qué cuerpo se escribieron — ver
`createHost` en `all-exceptions.filter.spec.ts`.

---

## 4. Qué se afirma

**Unitarias · 28 casos del filtro**

- Intercepta cualquier excepción: `QueryFailedError`, `EntityNotFoundError`,
  `ECONNREFUSED`, `TypeError`, un string suelto, `null`.
- Un 4xx de Nest se queda en una línea de `warn`; un `InternalServerErrorException`
  o cualquier 5xx del framework se vuelca completo, con stack.
- El volcado a consola contiene la query, los parámetros, el SQLSTATE, la tabla
  y la restricción; el código y el destino de un error de red; el stack de un
  bug; y el método y la ruta de la petición.
- El `traceId` acompaña a toda respuesta de error, es el que puso el middleware
  y es el mismo que quedó en el log. Si el filtro se usa sin el middleware
  delante, genera uno propio.
- Nada de la base de datos llega al cliente, y el `detail` de una regla de
  negocio tampoco.
- El sobre siempre tiene la misma forma.

**Unitarias · 24 casos del middleware**

- Acepta hexadecimal, uuid, alfanumérico con guiones, y los límites de 8 y 64
  caracteres.
- Descarta y reemplaza: vacío, corto, largo, con espacios, imitando una línea de
  log, con salto de línea, con escapes ANSI, un correo, un arreglo, un número,
  `null`.
- Deja el identificador en `req.requestId` y en el header, cede el paso siempre,
  y da uno distinto por petición.

**Punta a punta · 19 casos**

Levanta una aplicación Nest real con el interceptor y el filtro, y un
controlador de laboratorio donde cada ruta lanza una tecnología distinta.
Verifica sobre HTTP real lo que recibe el cliente y, sobre todo, lo que **no**
recibe.

---

## 5. Verlo a mano

Con la aplicación levantada, cualquier error real sirve. El cliente recibe:

```json
{
  "status": "ERROR",
  "code": "9999",
  "httpStatus": 500,
  "message": "Ocurrió un error inesperado. Intente más tarde.",
  "content": null,
  "traceId": "dd60de2d61ba"
}
```

Y la consola, para esa misma petición:

```
[18:42:11.507] ERROR: (dd60de2d61ba) [AllExceptionsFilter] POST /user
QueryFailedError: DatabaseError: duplicate key value violates unique constraint "uq_users_email"
    at UserRepository.save (.../user.repository.ts:41:20)
  query: 'INSERT INTO users(email, password) VALUES ($1, $2)',
  parameters: [ 'ana@komi.com', '$argon2id$v=19$...' ],
  driverError: Error [DatabaseError]: duplicate key value violates unique constraint
    severity: 'ERROR',
    code: '23505',
    table: 'users',
    constraint: 'uq_users_email',
    detail: 'Key (email)=(ana@komi.com) already exists.'
  }
    code: "9999"
    httpStatus: 500
[18:42:11.509] ERROR: (dd60de2d61ba) POST /user -> 500 | 34 ms
```

Son dos líneas que se complementan, unidas por el `traceId`: la del filtro trae
el volcado del fallo, y la de cierre dice cómo terminó la petición y cuánto
tardó. El identificador lo pone pino en cada línea de la petición, así que el
filtro ya no lo escribe dentro del mensaje.

Se le pide el `traceId` a quien reporta el error y se llega a la línea exacta.

> **Ojo con `parameters`.** El volcado completo incluye los valores enviados a
> la query: correos, nombres y, en un insert de usuario, el hash de la
> contraseña. Es lo que hace el log útil, pero conviene tenerlo presente si
> algún día esos logs salen de la máquina.

---

## 6. Deuda conocida

**`test/app.e2e-spec.ts` no corre.** Importa `AppModule`, que termina
importando el barrel `@/shared`; ese índice exporta los value objects, que
importan `uuid@14`, ESM puro que Jest (CommonJS) no puede parsear. No lo causa
este trabajo — ya venía así. Por lo mismo, `all-exceptions.filter.ts` importa
`DomainException` y `RESPONSE_CATALOG` por ruta directa en vez del barrel: sin
eso, su propio spec tampoco arrancaría.

Opciones para arreglarlo de raíz:

1. Un `tsconfig.spec.json` con `allowJs` más `transformIgnorePatterns` en Jest,
   para que ts-jest transpile `uuid`.
2. Reemplazar `uuid` por una implementación propia de UUID v7 — Node no trae v7
   en `crypto.randomUUID()`, que genera v4.

---

## 7. Mapa de archivos

```
src/infrastructure/http/
├── request-id.middleware.ts        crea/valida el id y lo pone en el header
├── request-id.middleware.spec.ts   24 casos
├── all-exceptions.filter.ts        el filtro
├── all-exceptions.filter.spec.ts   28 casos
└── cors.factory.ts                 X-Request-Id en allowedHeaders y exposedHeaders

src/main.ts                         app.use(requestIdMiddleware)
test/error-handling.e2e-spec.ts     19 casos sobre HTTP real
```

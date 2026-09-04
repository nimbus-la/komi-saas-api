# Manejo de errores y logs

Cómo se registra lo que pasa en la aplicación y cómo comprobar que
`AllExceptionsFilter` atrapa todo lo que no es una excepción de dominio, sea de
TypeORM, del driver de Postgres, de la red o un bug de JavaScript, sin filtrarle
nada de eso al cliente.

---

## 1. Qué hace el filtro

Sigue cuatro caminos según de dónde venga la excepción.

| Excepción | Al cliente | A la consola |
|---|---|---|
| `DomainException` | código y estado del catálogo | `warn` de una línea con el `detail` |
| `HttpException` **401** | su propio estado, código `1001` | `warn` con el payload de Nest |
| `HttpException` **404** | su propio estado, código `2000` | `warn` con el payload de Nest |
| `HttpException` **4xx** | su propio estado, código `1000` | `warn` con el payload de Nest |
| `HttpException` **5xx** | su propio estado, código `1000` | `error` con el objeto completo |
| Todo lo demás | `500` con el `9999` genérico | `error` con el objeto completo |

El filtro está registrado como global con `APP_FILTER` en `AppModule`, igual que
`ResponseInterceptor` con `APP_INTERCEPTOR`. Así no hay que acordarse de decorar
cada controlador y quedan cubiertas también las rutas que no existen, que es por
lo que el 404 tiene su propia entrada.

El volcado sale de `util.inspect(exception, { depth: 5 })`, o sea el stack y, en
el caso de TypeORM, la `query`, los `parameters` y el `driverError` con su
SQLSTATE, su tabla y su restricción.

El mensaje de la línea es siempre `MÉTODO /ruta -> HTTP <estado>` y el detalle va
en el campo `detail`, sea el texto de la excepción de dominio o el payload de
validación de Nest. Metido dentro del mensaje eran trescientos caracteres de
JSON que ni se leían ni se podían filtrar.

Distinguir el 4xx del 5xx importa. Un 400 o un 403 es un rechazo deliberado de un
guard o de un pipe y el payload de Nest ya lo dice todo, pero un
`InternalServerErrorException` es un fallo nuestro y sin stack no hay forma de
ubicarlo.

---

## 2. El identificador de la petición

Lo genera `pino-http` con `genReqId`, en `logger.config.ts`, al abrir la petición
y antes de que corra ningún guard, pipe ni controlador. Le toca uno a cada
petición, salga bien o mal.

- Si el cliente mandó `X-Request-Id` y pasa la validación, se respeta.
- Si no, se genera uno de 12 caracteres hexadecimales.
- Se devuelve siempre en el header `X-Request-Id`, también cuando todo va bien.

El filtro no lo fabrica, lo lee de `req.id`. Por eso el `traceId` del cuerpo, el
header de la respuesta y cada línea del log son el mismo valor.

Va en el cuerpo de toda respuesta y no solo en las de error, porque
`ResponseInterceptor` lo añade también al sobre de éxito. Un "esto se guardó mal"
que no produjo ningún error sigue teniendo así por dónde buscarse.

Hubo un middleware propio para esto que hacía lo mismo un paso antes. Con el
logger en su sitio era una pieza de más que había que mantener sincronizada con
`genReqId`.

### Por qué se acepta el del cliente

Así el front conserva la referencia aunque la petición nunca llegue al servidor
por un timeout o una caída de red, que es cuando más falta hace. Se puede aceptar
sin riesgo porque este identificador no autentica, no autoriza ni identifica a
nadie. Quien lo manipule solo se ensucia la correlación de sus propias
peticiones.

La validación es `/^[A-Za-z0-9-]{8,64}$/`. Node ya rechaza los saltos de línea y
los caracteres de control dentro de un header, así que no se puede colar una
línea falsa en el log, y corta los headers gigantes con un 431. Lo que evita el
patrón es texto que imite el formato del log y confunda un grep, o datos
personales metidos ahí por descuido.

---

## 3. Qué queda registrado de cada petición

Cada petición deja dos líneas, unidas por el `traceId`.

```
[2026-09-04 11:07:23.486] INFO: --> POST /auth/login?debug=true
    traceId: "6bc800279a48"
    payload: {
      "query": { "debug": "true" },
      "body": { "username": "ana", "password": "[REDACTADO]" }
    }
[2026-09-04 11:07:23.436] WARN: POST /auth/login?debug=true -> 401
    traceId: "6bc800279a48"
    responseTime: 184
    ip: "::1"
```

| Campo | De dónde sale |
|---|---|
| `responseTime`, `ip` | cómo terminó y desde dónde |
| `payload` | cuerpo, query string y parámetros de ruta, ya saneados |
| `tenantId`, `userId`, `branchId`, `rolScope` | el token que validó `JwtAuthGuard` |
| `req`, `res` | solo en JSON, con método, ruta, IP y `user-agent` |

La línea de entrada solo aparece si se puede registrar el cuerpo. Si el proceso
se cae o se cuelga a mitad de una petición, la de cierre nunca se escribe y esa
es la única pista de cuál lo provocó. El cuerpo sale ahí y la de cierre no lo
repite.

El usuario se añade al cerrar y no en el serializador de la petición, porque pino
serializa el request al entrar, cuando el guard todavía no ha corrido. Al cuerpo
le pasaba lo mismo y salía siempre vacío.

Con la consola legible, `req` y `res` no se escriben, porque el mensaje ya dice
método, ruta y estado y eran ocho líneas para repetirlo. Sus serializadores
devuelven `undefined` en vez de quitarse. Quitarlos hace que pino vuelque el
objeto `ServerResponse` entero, que son doscientas líneas de sockets por
petición.

De los headers solo se guarda el `user-agent`. Los serializadores de serie los
vuelcan enteros y por ahí viaja el `Authorization`.

> **Añadir un campo sensible a un DTO obliga a tocar `sanitizer.util.ts`.**
> El cuerpo se registra entero salvo lo que tapa `SENSITIVE_FIELDS`, y lo que no
> esté en esa lista se escribe en claro.
>
> Hay dos capas y cubren cosas distintas. El saneador recorre el payload entero y
> tapa el campo a cualquier profundidad, sin distinguir mayúsculas, y es el que
> protege el cuerpo de la petición. El `redact` de pino cubre las líneas escritas
> a mano, como un `logger.info({ accessToken })`, pero solo llega a dos niveles y
> compara exacto, así que su lista va escrita como se escribe en el código. Las
> dos se comprueban contra un pino real en `logger.config.spec.ts`.
>
> El cuerpo también puede llevar datos personales, como un correo o un nombre. Es
> el precio de poder reproducir un fallo tal como llegó.

---

## 4. Las palancas del log

Las tres son opcionales. Sin ninguna, la aplicación loguea bien y decide el
entorno.

| Variable | Qué hace | En producción |
|---|---|---|
| `LOG_LEVEL` | nivel mínimo que se escribe | por defecto `info` |
| `LOG_PRETTY` | consola legible en vez de JSON | siempre apagada |
| `LOG_REQUEST_PAYLOAD` | registrar el cuerpo de cada petición | siempre apagada |

Las dos últimas se ignoran en producción diga lo que diga la variable, y por
motivos distintos. `pino-pretty` es dependencia de desarrollo, así que allí no
está instalado y activarlo tumbaría el arranque. Y el cuerpo de una petición son
datos del cliente y no material de depuración, porque un log se copia, se pega en
un ticket y se archiva.

Poner `LOG_REQUEST_PAYLOAD=false` mientras desarrollas apaga el cuerpo sin apagar
el log, que es lo que hace falta cuando se trabaja con datos reales. Con él se va
también la línea de entrada, que sin cuerpo no aporta nada.

Esto se decide en `logging.config.ts`, que tiene su propio spec. La fábrica de
pino recibe la decisión ya tomada y no conoce el entorno.

---

## 5. Las consultas a la base

Salen por pino, con el `traceId` de la petición que las disparó.

```
[2026-09-04 11:07:23.263] DEBUG: SELECT 9 cols FROM "tenants" WHERE tenant_slug = 'mi-negocio'
    traceId: "6bc800279a48"
    context: "TypeORM"
[2026-09-04 11:07:23.436] WARN: POST /auth/login -> 401
    traceId: "6bc800279a48"
```

Antes iban a la consola por su cuenta, sin hora, sin nivel y sin identificador,
así que quedaban sueltas entre las líneas de la petición y no se sabía cuál venía
de cuál.

La consulta se escribe para leerla y no para volver a ejecutarla, en
`query-format.util.ts`. Los valores van puestos en lugar de `$1` y `$2`, que
obligaban a contarlos con el dedo en un arreglo aparte, y la lista de alias de un
SELECT de TypeORM se resume en cuántas columnas son. Los valores largos se
cortan, así que un hash no acaba entero en la consola. Si hace falta la consulta
exacta, está en la base de datos.

Hay dos palancas y cada una hace algo distinto.

| Variable | Qué decide |
|---|---|
| `DB_LOGGING` | si TypeORM emite las consultas normales |
| `LOG_LEVEL` | si se ven, porque van en `debug` y con `info` desaparecen |

Las consultas que fallan se registran siempre, aunque `DB_LOGGING` esté en
`false`. Si una revienta dentro de un handler de eventos o de un `catch` que se
la traga, esa línea es la única constancia de que ocurrió. En una petición HTTP
se verá dos veces, aquí en el momento exacto y al final en el filtro con el
volcado completo, y las une el `traceId`.

A TypeORM ya no se le pasa `logging`. Con un logger propio llama a sus métodos
siempre y no consulta esa opción, así que dejarla haría creer que apaga algo.
Quien decide es el logger, y por eso recibe ese mismo valor.

---

## 6. Lo que falla fuera de una petición

Un error solo llega a `AllExceptionsFilter` si sube por el ciclo HTTP. Lo que
ocurre en un handler de eventos, dentro de un `catch` que devuelve `null` o
después de responder no pasa por ahí, así que esos sitios registran su propia
línea.

| Dónde | Nivel | Qué deja escrito |
|---|---|---|
| `EventEmitterPublisher` | `error` | el evento que no se pudo procesar, con su payload |
| `StockMovementHandlers` | `error` | `[AUDITORIA INCOMPLETA]` con los movimientos que faltaron |
| `JwtAuthGuard` | `debug` | por qué se rechazó de verdad el token |
| Adaptadores de auth | `debug` | por qué se respondió que no existe |
| `Argon2PasswordVerifier` | `debug` | que el hash guardado es ilegible |
| `process-errors.ts` | `fatal` | excepciones y promesas sin manejar, antes de salir |

Las líneas en `debug` son pistas y no incidencias. Al cliente se le sigue
respondiendo lo mismo de siempre, que las credenciales no valen o que eso no
existe, porque distinguir los casos hacia fuera le regala información a quien
esté probando. Para verlas hace falta `LOG_LEVEL=debug`, que es el valor por
defecto mientras desarrollas.

### Un evento que falla ya no tumba la petición

Cuando el publicador corre, la operación de negocio ya se guardó, sea el stock
movido o el usuario creado. Antes el error subía y la petición respondía 500 por
algo que sí había ocurrido, así que quien reintentaba lo hacía dos veces.

Ahora cada evento se emite por separado y uno roto no cancela a los siguientes.
El fallo queda registrado con su payload y la respuesta sigue siendo la que le
corresponde al hecho ya guardado. Esa constancia es lo que permite rehacer a mano
lo que quedó a medias, y por eso esas líneas deberían estar conectadas a alertas.

### Al salir por un error fatal

`registerProcessErrorHandlers` recoge lo que revienta fuera de toda petición.
Registra el fallo en `fatal`, que es el único nivel que vacía el buffer de pino
de golpe, cierra la aplicación con `app.close()` y sale con código 1. Lleva una
guarda contra la reentrada, porque un fallo grave viene acompañado de otros, y un
temporizador de cinco segundos por si el propio cierre se cuelga.

---

## 7. Cómo lo lee el front

```ts
// Del header, tanto en éxito como en error
const res = await fetch('/user');
const traceId = res.headers.get('X-Request-Id');
```

Para que eso funcione en el navegador, `X-Request-Id` está en las dos listas de
`cors.factory.ts`. En `allowedHeaders` para que el front pueda enviarlo y en
`exposedHeaders` para que pueda leerlo. Sin lo segundo, `headers.get(...)`
devuelve `null` sin dar ningún error, y en Postman o en `curl -i` funciona igual
porque ahí no se aplica CORS.

Lo más robusto es que el front genere el suyo y lo mande.

```ts
api.interceptors.request.use((config) => {
    config.headers['X-Request-Id'] = crypto.randomUUID().slice(0, 12);
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // Siempre lo hay, porque lo generó el propio front antes de salir.
        const traceId = error.config?.headers?.['X-Request-Id'];
        toast.error(`${error.response?.data?.message ?? 'Error de conexión'} (ref: ${traceId})`);
        return Promise.reject(error);
    },
);
```

Así el front tiene la referencia incluso si la petición nunca salió. Si llegó, la
encuentras en los logs con ese mismo identificador, y si no la encuentras, ese
hecho ya te dice dónde está el problema.

---

## 8. Verlo a mano

Con la aplicación levantada, cualquier error real sirve. El cliente recibe esto.

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

Y la consola, para esa misma petición, esto otro.

```
[2026-09-04 18:42:11.507] ERROR: POST /user -> HTTP 500
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
    traceId: "dd60de2d61ba"
    context: "AllExceptionsFilter"
    code: "9999"
    httpStatus: 500
[2026-09-04 18:42:11.509] ERROR: POST /user -> 500
    traceId: "dd60de2d61ba"
    responseTime: 34
```

Son dos líneas que se complementan y las une el `traceId`. La del filtro trae el
volcado del fallo y la de cierre dice cómo terminó la petición y cuánto tardó.

Se le pide el `traceId` a quien reporta el error y se llega a la línea exacta.

> **Ojo con `parameters`.** El volcado completo incluye los valores que se
> enviaron a la query, o sea correos, nombres y, en un insert de usuario, el hash
> de la contraseña. Es lo que hace útil el log, pero conviene tenerlo presente si
> algún día esos logs salen de la máquina.

---

## 9. Ejecutar las pruebas

```bash
# Todo el sistema de logs (73 casos)
npx jest src/infrastructure/logging --verbose

# El filtro, el interceptor y CORS (58 casos)
npx jest src/infrastructure/http --verbose

# Solo el filtro (31 casos)
npx jest src/infrastructure/http/all-exceptions.filter.spec.ts --verbose

# Un caso puntual, por nombre
npx jest src/infrastructure -t "driverError"

# Punta a punta sobre HTTP real (19 casos, otra configuración de jest)
npx jest --config ./test/jest-e2e.json test/error-handling.e2e-spec.ts --verbose

# Todas las del proyecto
npm test
```

> **Ojo.** Las pruebas punta a punta no corren con `npm test`, porque usan otra
> configuración. Conviene lanzarlas a mano cuando se toca el cableado de la
> aplicación, que es justo cuando se rompen sin que nadie se entere.

---

## 10. Fabricar el error sin base de datos

No hace falta una base caída ni una tabla duplicada. Los errores que interesan
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

// Una regla de negocio. DomainException es abstracta, así que la prueba
// declara su propia subclase.
class ItemAlreadyExistsExceptionStub extends DomainException {
    constructor() {
        super({ code: '1302', detail: 'El item "Harina" ya existe en el tenant 42.' });
    };
};
```

Para el filtro hace falta un `ArgumentsHost`, que en la prueba son veinte líneas
capturando qué estado y qué cuerpo se escribieron. Está en `createHost`, dentro
de `all-exceptions.filter.spec.ts`.

---

## 11. Qué se afirma

**El filtro, 31 casos**

- Atrapa cualquier excepción, sea `QueryFailedError`, `EntityNotFoundError`,
  `ECONNREFUSED`, un `TypeError`, un string suelto o `null`.
- Un 4xx de Nest se queda en una línea de `warn`, y un
  `InternalServerErrorException` o cualquier 5xx del framework se vuelca
  completo, con stack.
- El volcado lleva la query, los parámetros, el SQLSTATE, la tabla y la
  restricción; el código y el destino de un error de red; el stack de un bug; y
  el método y la ruta de la petición.
- El `traceId` acompaña a toda respuesta de error y es el que puso pino. Fuera de
  ese ciclo, el filtro genera uno propio.
- Nada de la base de datos llega al cliente, y el `detail` de una regla de
  negocio tampoco.
- El sobre siempre tiene la misma forma.

**El sistema de logs, 73 casos**

- El identificador se genera, respeta el válido que mande el cliente, descarta el
  que no cumple el formato y sale por el header.
- La línea de cierre sube de nivel según cómo terminó la petición.
- El cuerpo se sanea a cualquier profundidad, se acota en tamaño y no pierde las
  fechas ni los errores. Se comprueba contra un pino real, no mirando la lista de
  campos.
- Las consultas se escriben con los valores puestos y las columnas resumidas.
- En producción no hay consola legible ni cuerpo de peticiones, diga lo que diga
  la variable de entorno.
- Al salir por un error fatal se cierra la aplicación, no se intenta dos veces y
  se sale igual si el cierre se cuelga.

**Punta a punta, 19 casos**

Levanta una aplicación Nest real con el mismo cableado que `AppModule` y un
controlador de laboratorio donde cada ruta lanza una tecnología distinta.
Comprueba sobre HTTP real lo que recibe el cliente y, sobre todo, lo que no
recibe.

---

## 12. Deuda conocida

**`test/app.e2e-spec.ts` no corre.** Importa `AppModule`, que termina importando
el barrel `@/shared`; ese índice exporta los value objects, que importan
`uuid@14`, ESM puro que Jest no puede parsear en CommonJS. No lo causó este
trabajo, ya venía así. Por lo mismo, `all-exceptions.filter.ts` importa
`DomainException` y `RESPONSE_CATALOG` por ruta directa en vez del barrel, porque
si no su propio spec tampoco arrancaría.

Para arreglarlo de raíz hay dos caminos.

1. Un `tsconfig.spec.json` con `allowJs` más `transformIgnorePatterns` en Jest,
   para que ts-jest transpile `uuid`.
2. Reemplazar `uuid` por una implementación propia de UUID v7, ya que Node no
   trae v7 en `crypto.randomUUID()`, que genera v4.

---

## 13. Mapa de archivos

```
src/infrastructure/logging/
├── logger.config.ts           la configuración de pino
├── trace-id.util.ts           crea y valida el identificador de la petición
├── sanitizer.util.ts          tapa los campos sensibles y acota el tamaño
├── query-format.util.ts       deja las consultas SQL legibles
├── database.logger.ts         el logger de TypeORM
├── process-errors.ts          lo que revienta fuera de una petición
└── logging.module.ts          monta todo, global para toda la app

src/infrastructure/config/logging.config.ts   qué decide cada entorno

src/infrastructure/http/
├── all-exceptions.filter.ts   el filtro
├── response.interceptor.ts    el sobre de respuesta, con el traceId
└── cors.factory.ts            X-Request-Id en allowedHeaders y exposedHeaders

test/error-handling.e2e-spec.ts    19 casos sobre HTTP real
```

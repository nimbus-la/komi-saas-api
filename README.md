# Komi SaaS API

API de Komi, un sistema de gestión para restaurantes que funciona como SaaS. Un mismo servidor atiende a muchos negocios a la vez, y cada negocio solo ve y modifica su propia información.

Hoy la API cubre estas áreas:

- **Negocios (tenants)**: el restaurante como cliente de la plataforma, con su nombre, NIT y un slug que lo identifica al iniciar sesión.
- **Sucursales**: las sedes físicas de cada negocio.
- **Usuarios y roles**: el personal del negocio. Los roles son fijos y se dividen en administrativos (dueño, administrador, supervisor), que no pertenecen a ninguna sucursal, y operativos (cajero, mesero, cocina), que siempre están asignados a una.
- **Autenticación**: inicio de sesión, renovación de la sesión y cierre de sesión.
- **Inventario**: los insumos del negocio, organizados por lotes con costo y fecha de vencimiento. Permite recibir mercancía, consumir, registrar mermas, hacer conteos y definir stock mínimo general o por sucursal. Al consumir se descuenta primero de los lotes que vencen antes.
- **Movimientos de inventario**: una bitácora de cada entrada, salida, merma o ajuste. Nunca se edita ni se borra; si hay que corregir algo, se registra un movimiento nuevo.
- **Productos y categorías**: lo que vende el restaurante, con su precio base, margen de ganancia y receta, que indica qué insumos del inventario lleva y en qué cantidad.
- **Menú**: el árbol de opciones de la barra lateral del frontend.

## Tecnologías

- **Node.js** con **TypeScript** en modo estricto.
- **NestJS 11** como framework.
- **PostgreSQL 18** como base de datos, con **TypeORM** para el acceso a datos.
- **JWT** para el token de acceso y una cookie httpOnly para la sesión.
- **Argon2** para las contraseñas.
- **class-validator** y **class-transformer** para validar lo que llega en cada petición.
- **Pino** (con nestjs-pino) para los logs.
- **decimal.js** para los cálculos de dinero y cantidades, así no se pierden centavos por redondeo.
- **Jest** y **Supertest** para las pruebas.
- **Docker Compose** para levantar la base de datos en local.
- **pnpm** como gestor de paquetes.

## Cómo iniciar el proyecto

### Lo que necesitas instalado

- Node.js. Los tipos del proyecto son los de Node 24, así que lo recomendable es usar esa versión.
- pnpm. Si ya tienes Node, lo puedes activar con `corepack enable`.
- Docker, para la base de datos.

### Pasos

1. Instala las dependencias.

   ```bash
   pnpm install
   ```

2. Crea tu archivo `.env` copiando el de ejemplo y ajusta lo que necesites. Como mínimo cambia `JWT_SECRET`. Cada variable está explicada más abajo.

   ```bash
   cp .env.exam .env
   ```

3. Levanta la base de datos. La primera vez que arranca, Postgres crea las tablas y carga los roles y el menú a partir de los scripts de `public/db`.

   ```bash
   docker compose up -d
   ```

   Además de Postgres se levanta Adminer, un cliente web para ver la base, en http://localhost:8080.

4. Arranca la API en modo desarrollo. Se reinicia sola cada vez que guardas un cambio.

   ```bash
   pnpm start:dev
   ```

   Si todo sale bien, en la consola aparece la dirección donde quedó corriendo, por defecto http://localhost:3000.

Si falta alguna variable de entorno obligatoria o tiene un valor inválido, la aplicación no arranca y te dice cuál es el problema.

### Primer negocio y primer usuario

Todas las rutas piden sesión, menos las de autenticación, y para iniciar sesión hace falta un negocio y un usuario que ya existan. En desarrollo, `POST /seed` crea cuatro negocios de prueba con sucursales, usuarios de todos los roles, inventario y productos. Cómo se usa y qué crea está en [docs/seed.md](docs/seed.md).

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm start:dev` | Arranca en modo desarrollo y se reinicia con cada cambio |
| `pnpm start:debug` | Igual que el anterior, pero con el depurador activado |
| `pnpm build` | Compila el proyecto en la carpeta `dist` |
| `pnpm start:prod` | Ejecuta lo compilado en `dist` |
| `pnpm test` | Corre las pruebas unitarias |
| `pnpm test:watch` | Corre las pruebas unitarias y las repite con cada cambio |
| `pnpm test:cov` | Corre las pruebas unitarias y genera el reporte de cobertura |
| `pnpm test:e2e` | Corre las pruebas de punta a punta de la carpeta `test` |

Para correr un solo archivo de pruebas, pásale la ruta:

```bash
pnpm test -- src/auth/application/use-cases/login/login.use-case.spec.ts
```

Y para correr una sola prueba por su nombre:

```bash
pnpm test -- -t "nombre de la prueba"
```

El comando `pnpm lint` por ahora no funciona. La configuración de ESLint usa una regla de Prettier, pero el plugin de Prettier no está instalado.

## Variables de entorno

Se leen del archivo `.env` en la raíz. El archivo `.env.exam` trae un ejemplo completo con valores para desarrollo local.

### Generales

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `NODE_ENV` | Sí | Entorno en el que corre la aplicación: `development`, `production` o `test`. Es obligatoria porque de ella dependen varias reglas de seguridad, como permitir localhost en CORS o mandar la cookie solo por HTTPS. |
| `PORT` | No | Puerto donde escucha la API. Si no se define, usa el 3000. |

### Base de datos

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `DB_HOST` | Sí | Dirección del servidor de Postgres. En local es `localhost`. |
| `DB_PORT` | Sí | Puerto de Postgres, normalmente 5432. |
| `DB_USER` | Sí | Usuario de la base. |
| `DB_PASSWORD` | Sí | Contraseña de ese usuario. |
| `DB_NAME` | Sí | Nombre de la base de datos. |
| `DB_SYNCHRONIZE` | No | Si vale `true`, TypeORM modifica las tablas para que coincidan con las entidades del código. Debe quedarse en `false`, porque el esquema lo definen los scripts SQL. |
| `DB_LOGGING` | No | Si vale `true`, cada consulta SQL aparece en el log en nivel debug. |
| `DB_SSL` | No | Ponla en `true` cuando la base esté en un servicio en la nube que exija conexión segura. |

El archivo `docker-compose.yaml` usa estas mismas variables `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_PORT` para crear el contenedor, así que la API y la base quedan configuradas con los mismos datos.

### CORS

Controlan desde qué páginas web se puede llamar a la API.

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `CORS_ORIGINS` | Sí | Direcciones del frontend que tienen permiso, separadas por comas. Por ejemplo `https://app.komi.com,https://www.komi.com`. No importa si las escribes con mayúsculas o con barra al final. Con `*` se abre a cualquier origen, pero en producción la aplicación se niega a arrancar así. |
| `CORS_CREDENTIALS` | No | Permite que el navegador envíe cookies en las peticiones. Solo acepta `true` o `false` y por defecto es `true`. Tiene que estar activa para que funcione la sesión. |
| `CORS_MAX_AGE` | No | Segundos que el navegador guarda la respuesta de la verificación previa de CORS antes de volver a preguntar. Por defecto 86400, que es un día. |

Fuera de producción, localhost siempre se permite aunque no esté en la lista.

### Sesión y JWT

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `JWT_SECRET` | Sí | Clave con la que se firman los tokens. Debe tener al menos 32 caracteres. Puedes generar una con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. |
| `JWT_ACCESS_TTL` | No | Duración del token de acceso en segundos. Por defecto 900, que son 15 minutos. El mínimo es 60. |
| `JWT_REFRESH_TTL_DAYS` | No | Días que dura la sesión antes de que el usuario tenga que volver a iniciar sesión. Por defecto 7. |

### Cookie de sesión

La sesión se guarda en una cookie llamada `vorea_session`, que el navegador no deja leer desde JavaScript.

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `COOKIE_DOMAIN` | No | Dominio de la cookie. Lo normal es no definirla, y así la cookie solo vale para el dominio de la API. Úsala únicamente si la cookie se tiene que compartir entre subdominios. |
| `COOKIE_SAME_SITE` | No | En qué casos el navegador envía la cookie. Acepta `lax`, `strict` o `none`, en minúsculas, y por defecto es `lax`. |

Sobre `COOKIE_SAME_SITE`, lo que conviene saber para elegir:

- Usa `lax` cuando el frontend y la API compartan dominio, por ejemplo `restaurante.komi.com` y `api.komi.com`. Funciona en todos los navegadores.
- Usa `none` cuando estén en dominios distintos, por ejemplo uno en Vercel y otro en Railway. En ese caso la cookie solo viaja por HTTPS, y Safari la bloquea sin que haya forma de evitarlo. Chrome y Firefox sí la aceptan.
- Dos servicios de Railway bajo `up.railway.app` cuentan como dominios distintos para el navegador, aunque estén en la misma cuenta.

Fuera de desarrollo y pruebas, la cookie solo se envía por HTTPS.

### Logs

Las tres son opcionales. Sin definir ninguna, el log se comporta bien según el entorno.

| Variable | Para qué sirve |
|---|---|
| `LOG_LEVEL` | Nivel mínimo de lo que se escribe: `fatal`, `error`, `warn`, `info`, `debug`, `trace` o `silent`. Si no se define, en desarrollo es `debug`, en producción `info` y en pruebas `silent`. |
| `LOG_PRETTY` | Con `true` el log sale con colores y fácil de leer; con `false` sale en JSON. Por defecto es `true`. En producción siempre sale en JSON. |
| `LOG_REQUEST_PAYLOAD` | Guarda en el log el cuerpo, los parámetros y la query de cada petición, con contraseñas y tokens ocultos. Por defecto es `true`. Sirve apagarla en desarrollo si trabajas con datos reales. En producción nunca se activa. |

## Arquitectura

El proyecto sigue diseño guiado por el dominio con arquitectura hexagonal. Las reglas del negocio viven aparte y no dependen de NestJS, de la base de datos ni de HTTP, así que se pueden probar de forma aislada y el resto de piezas se pueden cambiar sin tocarlas.

```
src/
  auth/            autenticación y sesiones
  context/         un módulo por cada área del negocio
  infrastructure/  configuración, base de datos, logs, eventos y lo común de HTTP
  shared/          piezas de dominio que usan todos los módulos
  interfaces/      tipos compartidos
  utils/           constantes y utilidades
public/db/         scripts SQL de la base de datos
test/              pruebas de punta a punta
docs/              documentación adicional
```

Cada módulo se divide en tres capas: **domain** con las reglas, **application** con los casos de uso e **infrastructure** con los controladores y la base de datos. Todas las respuestas de la API, salgan bien o mal, tienen el mismo formato e incluyen un `traceId` para rastrear la petición en el log.

La explicación completa, con ejemplos y los pasos para agregar módulos, casos de uso o eventos, está en [docs/arquitectura.md](docs/arquitectura.md). Los errores y los logs están explicados en [docs/manejo-de-errores-y-logs.md](docs/manejo-de-errores-y-logs.md).

### Autenticación y separación entre negocios

- Para iniciar sesión se envían el slug del negocio, el usuario y la contraseña a `POST /auth/login`.
- La API devuelve un token de acceso, que el frontend manda en el encabezado `Authorization` en cada petición, y guarda la sesión en la cookie `vorea_session`.
- Cuando el token de acceso vence, `POST /auth/refresh` entrega uno nuevo usando la cookie. Cada renovación cambia también la sesión guardada, y la anterior deja de servir.
- Todas las rutas exigen un token válido, salvo las marcadas como públicas, que hoy son solo las de autenticación.
- El negocio con el que se trabaja siempre sale del token, nunca de lo que envía el cliente. Además hay una protección general que rechaza cualquier petición que intente hablar de un negocio distinto al del usuario.

## Base de datos

La base es PostgreSQL. El proyecto no usa migraciones de TypeORM. El esquema está escrito a mano en los scripts de `public/db`, y Postgres los ejecuta en orden la primera vez que se crea el contenedor:

| Archivo | Contenido |
|---|---|
| `01-init.sql` | Las tablas principales: negocios, sucursales, roles, usuarios, inventario con sus lotes y configuración por sucursal, movimientos, categorías, productos e ingredientes de receta. También la secuencia que genera el SKU de los productos. |
| `02-roles.sql` | Los roles fijos del sistema: dueño, administrador, supervisor, cajero, mesero y cocina. |
| `03-sessions.sql` | La tabla de sesiones. |
| `04-menus.sql` | La tabla del menú lateral y sus opciones. |

Algunas cosas a tener en cuenta:

- Como los scripts solo corren cuando el volumen de Docker está vacío, un cambio en el esquema no se aplica solo a una base que ya existe. Hay que ejecutar el cambio a mano o borrar el volumen para empezar de cero con `docker compose down -v`, sabiendo que eso borra todos los datos.
- Casi todas las tablas tienen una columna `tenant_id` que indica a qué negocio pertenece cada registro. Las excepciones son los roles y el menú, que son iguales para todos.
- Los negocios no se borran de verdad; se marcan como eliminados.
- La tabla de sesiones crece con cada inicio de sesión y cada renovación. El script `public/db/maintenance/purge-sessions.sql` borra las que llevan más de 30 días vencidas. No corre solo: hay que programarlo, por ejemplo con un cron diario, o ejecutarlo a mano:

  ```bash
  docker exec -i erp_postgres psql -U erp_user -d erp < public/db/maintenance/purge-sessions.sql
  ```

## Pruebas

- Las pruebas unitarias están junto al código que prueban, en archivos que terminan en `.spec.ts`. Cubren sobre todo los casos de uso, los guards, la configuración y el manejo de errores.
- Las pruebas de punta a punta están en la carpeta `test` y terminan en `.e2e-spec.ts`.
- Los casos de uso no dependen de NestJS, así que se prueban pasándoles implementaciones falsas de sus puertos, sin levantar la aplicación ni la base de datos.

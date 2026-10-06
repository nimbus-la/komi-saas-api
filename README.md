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

Se leen del archivo .env en la raíz. El archivo .env.exam trae un ejemplo completo con valores para desarrollo local. Si falta una variable obligatoria o alguna trae un valor que no corresponde, la aplicación no arranca y dice cuál es.

### Generales

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| NODE_ENV | Sí | Dice en qué entorno corre la aplicación, que puede ser development, production o test. De ella dependen varias reglas de seguridad, como permitir localhost en CORS o mandar las cookies solo por HTTPS, y también el formato del log. |
| PORT | No | Puerto donde escucha la API. Si no se define, usa el 3000. |

### Base de datos

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| DB_HOST | Sí | Dirección del servidor de Postgres. En local es localhost. |
| DB_PORT | Sí | Puerto de Postgres, normalmente 5432. |
| DB_USER | Sí | Usuario de la base. |
| DB_PASSWORD | Sí | Contraseña de ese usuario. |
| DB_NAME | Sí | Nombre de la base de datos. |
| DB_SSL | No | Ponla en true cuando la base esté en un servicio en la nube que exija conexión cifrada. Solo acepta true o false. |

TypeORM nunca modifica las tablas, porque el esquema lo definen los scripts SQL de public/db. Las consultas SQL aparecen en el log solo mientras desarrollas.

El archivo docker-compose.yaml usa estas mismas variables DB_USER, DB_PASSWORD, DB_NAME y DB_PORT para crear el contenedor, así que la API y la base quedan configuradas con los mismos datos.

### CORS

Controla desde qué páginas web se puede llamar a la API.

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| CORS_ORIGINS | Sí | Direcciones del frontend que tienen permiso, separadas por comas, por ejemplo https://app.komi.com,https://www.komi.com. No importa si las escribes con mayúsculas o con barra al final. El asterisco no se admite, porque la sesión viaja en cookies y el navegador no las manda a un origen abierto a cualquiera. |

Fuera de producción, localhost se permite en cualquier puerto aunque no esté en la lista. Esta misma lista la usa la protección contra peticiones que llegan desde otros sitios, así que la dirección del propio frontend también tiene que estar en ella.

### Sesión y JWT

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| JWT_SECRET | Sí | Clave con la que se firman los tokens. Debe tener al menos 32 caracteres. Más abajo está el comando para generar una. |
| JWT_ACCESS_TTL | No | Duración del token de acceso en segundos. Por defecto 900, que son 15 minutos. El mínimo es 60. |
| JWT_REFRESH_TTL_DAYS | No | Días que dura la sesión antes de que el usuario tenga que volver a iniciar sesión. Por defecto 7. |

Para generar una clave segura puedes usar este comando.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Cookies de sesión

La sesión viaja en dos cookies que el navegador no deja leer desde JavaScript. La cookie jwt_access lleva el token de acceso y jwt_refresh lleva el de renovación. No tienen variables propias.

Las dos se mandan solo al host de la API, valen para todas sus rutas y usan el modo lax. Ese modo funciona en todos los navegadores siempre que el frontend y la API compartan dominio, como restaurante.komi.com y api.komi.com, o que el frontend reenvíe las llamadas a la API desde su propio dominio. Fuera de desarrollo y pruebas solo viajan por HTTPS.

### Logs

Las dos son opcionales. Sin definirlas, el log se comporta bien según el entorno. En desarrollo sale con colores y fácil de leer, y en producción sale en JSON.

| Variable | Para qué sirve |
|---|---|
| LOG_LEVEL | Nivel mínimo de lo que se escribe, que puede ser fatal, error, warn, info, debug, trace o silent. Si no se define, en desarrollo es debug, en producción info y en pruebas silent. |
| LOG_REQUEST_PAYLOAD | Guarda en el log el cuerpo, los parámetros y la query de cada petición, con contraseñas y tokens ocultos. Viene activa en desarrollo, y ponerla en false sirve cuando trabajas con datos reales. En producción nunca se activa. |

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
- La API guarda el token de acceso y el de renovación en las cookies jwt_access y jwt_refresh. El frontend no maneja ningún token, solo tiene que enviar sus peticiones con credenciales. Para probar con Postman o curl también se acepta el token de acceso en el encabezado Authorization.
- Cuando el token de acceso vence, POST /auth/refresh entrega uno nuevo usando la cookie de renovación. Cada renovación cambia también la sesión guardada, y la anterior deja de servir.
- Las peticiones que modifican datos se rechazan si vienen de una página que no está en CORS_ORIGINS. Así una página ajena no puede aprovechar la sesión abierta del usuario.
- Todas las rutas exigen un token válido, salvo las marcadas como públicas, que hoy son solo las de autenticación.
- El negocio con el que se trabaja siempre sale del token, nunca de lo que envía el cliente. Además hay una protección general que rechaza cualquier petición que intente hablar de un negocio distinto al del usuario.

## Base de datos

La base es PostgreSQL. El proyecto no usa migraciones de TypeORM. El esquema está escrito a mano en los scripts de `public/db`, y Postgres los ejecuta en orden la primera vez que se crea el contenedor:

| Archivo | Contenido |
|---|---|
| `01-init.sql` | Las tablas principales: negocios, sucursales, roles, usuarios, inventario con sus lotes y configuración por sucursal, movimientos, categorías, productos e ingredientes de receta. La tabla de sucursales está en `tables/branches.sql`, y los productos, sus recetas, la secuencia del SKU y la configuración de precio y estado por sucursal están en `tables/products.sql`. Los dos se incluyen desde aquí con `\ir`, por eso este script se ejecuta con `psql` y no desde Adminer. |
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
- Las pruebas de punta a punta están en la carpeta `test` y terminan en `.e2e-spec.ts`. Algunas necesitan Postgres arriba (`docker compose up -d`) y usan las credenciales del `.env`:
  - `app.e2e-spec.ts` levanta la aplicación completa y se conecta a la base de desarrollo, pero no escribe nada.
  - `branch.e2e-spec.ts` crea una base temporal con el esquema de `public/db`, corre contra ella y la borra al terminar. Para otra prueba que necesite base, usa el helper `test/support/temporary-database.ts`.
- Los casos de uso no dependen de NestJS, así que se prueban pasándoles implementaciones falsas de sus puertos, sin levantar la aplicación ni la base de datos.

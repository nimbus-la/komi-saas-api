# Arquitectura

Esta guía explica cómo está organizado el código de la API, por qué está hecho así y cómo trabajar dentro de esa estructura: agregar un módulo, un caso de uso, un endpoint o reaccionar a lo que pasa en otro módulo.

Los ejemplos salen del módulo de categorías de productos (`src/context/product-categories`), porque es pequeño y tiene todas las piezas. Si tienes dudas sobre cómo se hace algo, ese módulo es una buena referencia para abrir al lado.

---

## 1. La idea general

El proyecto sigue diseño guiado por el dominio (DDD) con arquitectura hexagonal. Dicho de forma sencilla:

- Las reglas del negocio viven en un lugar propio y no saben nada de NestJS, de TypeORM ni de HTTP.
- Todo lo demás (la base de datos, los controladores, los tokens, los logs) se conecta a esas reglas desde afuera.

Lo que se gana con esto:

- Las reglas se pueden probar sin levantar la aplicación ni la base de datos.
- Si mañana cambia la forma de guardar algo, se cambia el repositorio y las reglas quedan igual.
- Cada regla está en un solo sitio. No hay que buscar en el controlador, en el servicio y en la consulta para entender por qué se rechazó algo.

El costo es que hay más archivos que en un proyecto NestJS clásico. Para crear una categoría intervienen un controlador, un DTO, un caso de uso, un agregado, dos objetos de valor, un repositorio, un mapeador y un modelo. Cada uno hace poco, y eso es justamente lo que lo vuelve fácil de leer y de cambiar.

---

## 2. Mapa de carpetas

```
src/
  main.ts              arranque de la aplicación
  app.module.ts        módulo raíz, importa todos los demás
  auth/                autenticación y sesiones
  context/             un módulo por cada área del negocio
  infrastructure/      piezas técnicas compartidas
    config/            carga y validación de variables de entorno
    database/          conexión a Postgres
    events/            publicación de eventos de dominio
    http/              filtro de errores, interceptor de respuestas, cookie de sesión
    logging/           configuración de pino, saneo de datos sensibles
  shared/              piezas de dominio que usan todos los módulos
    domain/            AggregateRoot, Entity, DomainEvent, DomainException, EventPublisher
    value-object/      Uuid, Money, Quantity
    response-catalog.ts
  interfaces/          tipos compartidos (respuesta de la API, paginación, configuración)
  utils/               constantes y enums
```

Cada módulo de `context` y el de `auth` tienen por dentro la misma forma:

```
product-categories/
  domain/
    product-category.aggregate.ts
    product-category.repository.ts
    value-object/
    exceptions/
    types/
    index.ts
  application/
    use-cases/
      create-category/create-category.use-case.ts
      update-category/update-category.use-case.ts
      search-categories/search-categories.use-case.ts
    ports/
    index.ts
  infrastructure/
    http/
      category.controller.ts
      dto/
    persistence/
      models/
      mappers/
      repository/
      adapters/
    index.ts
  categories.module.ts
  index.ts
```

Entre módulos hay pequeñas diferencias de nombres (`repository` o `repositories`, `use-case` o `use-cases`, `value-object` o `value-objects`). Para algo nuevo usa la forma en plural que tienen la mayoría.

---

## 3. Recorrido de una petición

Así viaja `POST /products/categories` desde que llega hasta que responde:

1. **Logger.** pino-http le asigna un identificador a la petición (el `traceId`).
2. **Guards globales.** `JwtAuthGuard` valida el token y deja el usuario en la petición. Luego `TenantScopeGuard` revisa que ningún `tenantId` de la petición sea distinto al del token.
3. **ValidationPipe.** Convierte el cuerpo en un `CreateCategoryDto` y lo valida. Si sobra o falta un campo, responde 400 aquí mismo.
4. **Controlador.** `CategoryController.create` toma el negocio del usuario autenticado, lo junta con el DTO y llama al caso de uso.
5. **Caso de uso.** `CreateCategoryUseCase` comprueba que el negocio exista, crea el objeto de valor `CategoryName`, revisa que no haya otra categoría con ese nombre, crea el agregado y lo guarda.
6. **Repositorio.** `ProductCategoryRepositoryImpl` convierte el agregado en una fila con el mapeador y la inserta con TypeORM.
7. **Interceptor.** `ResponseInterceptor` envuelve el resultado en el formato común de respuesta.
8. **Filtro de errores.** Si en cualquier paso se lanzó una excepción, `AllExceptionsFilter` la convierte en la respuesta de error correspondiente.

El controlador no tiene lógica, el caso de uso no sabe que existe HTTP y el agregado no sabe que existe una base de datos.

---

## 4. Las capas en detalle

### 4.1 Dominio

Es el centro. Aquí están las reglas del negocio y nada más. **No puede importar nada de NestJS, TypeORM, Express ni de la carpeta `infrastructure`.** Solo puede importar de `@/shared` y de su propio dominio.

#### Agregados

El agregado es la entidad principal del módulo y la única puerta para modificarla. Hereda de `AggregateRoot` y cumple estas reglas:

- **El constructor es privado.** Se crea de dos formas:
  - `create(...)` para uno nuevo. Genera su id, pone las fechas y los valores iniciales.
  - `fromPrimitives(...)` para reconstruirlo desde la base de datos.
- **Sus propiedades son privadas.** No se cambian desde afuera; se llaman métodos con nombre de negocio, como `activate()`, `deactivate()` o `update(...)`, que validan antes de cambiar.
- **`toPrimitives()`** devuelve sus datos como un objeto plano, que es lo que usa el mapeador para guardarlo.

```ts
public deactivate(): void {
    if (!this.isActive) {
        throw new ProductCategoryAlreadyDeactivatedException();
    }

    this.isActive = false;
    this.touch();
}
```

El id lo genera el dominio, no la base de datos. Por eso las tablas usan `@PrimaryColumn` y no una columna autogenerada.

#### Objetos de valor

Representan un dato con reglas propias: un nombre, un id, un precio, una cantidad. Se validan al crearse, así que si existe un `CategoryName` ya se sabe que es válido.

```ts
export class CategoryName {
    private constructor(public readonly value: string) { }

    public static create(raw: string): CategoryName {
        const value = raw.trim();

        if (value.length < CategoryName.MIN_LENGTH) {
            throw new CategoryNameTooShortException(CategoryName.MIN_LENGTH);
        }

        return new CategoryName(value);
    }
}
```

Los ids de cada módulo heredan de `Uuid`, que ya valida el formato. Dos ids de tipos distintos nunca se consideran iguales aunque tengan el mismo valor.

Para dinero y cantidades se usan `Money` y `Quantity` de `@/shared`, que trabajan con decimal.js. Nunca hagas cuentas de dinero con `number`.

#### Excepciones

Cada regla rota lanza una subclase de `DomainException` con un código y un detalle:

```ts
export class ProductCategoryAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: "1435",
            detail: `La categoría "${name}" ya existe.`,
        });
    }
}
```

- El **código** tiene que estar registrado en `src/shared/response-catalog.ts`. Ahí se define el mensaje que ve el cliente y la categoría del error, que decide el estado HTTP (validación da 400, no encontrado 404, conflicto 409, no autorizado 401, prohibido 403).
- El **detalle** es para el log. Puede llevar ids y datos técnicos porque nunca llega al cliente.
- Si el código no está en el catálogo, la respuesta sale como error interno `9999`. Es fácil que pase sin darse cuenta.

Cada módulo tiene su rango de códigos, anotado con comentarios en el catálogo. Por ejemplo, inventario usa del 1300 al 1399, productos del 1400 al 1433 y categorías del 1434 al 1466. Antes de elegir un código nuevo, revisa que no esté usado.

Nunca lances `Error` ni `HttpException` desde el dominio o la aplicación.

#### Eventos de dominio

Un evento es un hecho que ya ocurrió, en pasado. Hereda de `DomainEvent`, tiene un nombre con espacio de nombres y todos sus campos son de solo lectura:

```ts
export class StockReceivedEvent extends DomainEvent {
    public readonly eventName = 'inventory.stock.received';

    public readonly itemId: string;
    public readonly tenantId: string;
    // ...
}
```

El agregado lo registra dentro de su método con `this.registerEvent(...)`. Todavía no se publica: se publica después de guardar, en el caso de uso.

Los campos del evento son datos simples (textos, números, fechas), no objetos de valor, para que quien lo escuche no dependa del dominio de otro módulo.

#### Repositorio

Es una clase abstracta en el dominio que dice qué operaciones de guardado y búsqueda necesita el módulo, hablando en términos del agregado:

```ts
export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;
    abstract findById(id: string, tenantId: string): Promise<ProductCategory | null>;
    abstract existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean>;
    abstract update(category: ProductCategory): Promise<void>;
    abstract search(filters: SearchCategoriesFilters, pagination: Pagination): Promise<Paginated<ProductCategory>>;
}
```

Casi todos los métodos reciben el `tenantId`. Buscar algo solo por su id, sin el negocio, es la forma más fácil de dejar que un negocio vea datos de otro.

Se usa una clase abstracta y no una interfaz porque TypeScript borra las interfaces al compilar, y NestJS necesita algo que exista en tiempo de ejecución para saber qué inyectar.

### 4.2 Aplicación

Aquí están los casos de uso. Coordinan: buscan lo que necesitan, le piden al agregado que haga su trabajo, lo guardan y publican los eventos. **Las reglas no se escriben aquí, se escriben en el agregado o en los objetos de valor.** Esta capa tampoco importa NestJS ni TypeORM.

#### Casos de uso

Un caso de uso es una clase con un único método público `execute`. No lleva `@Injectable()`, recibe todo por el constructor y el módulo se encarga de construirlo.

```ts
export class CreateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,
    ) { }

    public async execute(params: CreateCategoryApplicationParams): Promise<void> {
        const tenantExists = await this.tenantChecker.exists(params.tenantId);

        if (!tenantExists) {
            throw new TenantNotFoundException(params.tenantId);
        }

        const name = CategoryName.create(params.name);

        if (await this.repository.existsByName(name.value, params.tenantId)) {
            throw new ProductCategoryAlreadyExistsException(name.value);
        }

        const category = ProductCategory.create({
            tenantId: params.tenantId,
            name,
            description: params.description,
        });

        await this.repository.save(category);
    }
}
```

El orden habitual dentro de `execute` es:

1. Comprobar lo que depende de otros módulos, como que exista el negocio o la sucursal.
2. Cargar el agregado, o crearlo.
3. Llamar a sus métodos.
4. Guardar.
5. Si el agregado registró eventos, publicarlos y limpiarlos:

   ```ts
   await this.repository.save(item);

   await this.eventPublisher.publish(item.getDomainEvents());
   item.clearDomainEvents();
   ```

Los parámetros de entrada son tipos planos definidos en `domain/types` o `application/dtos`, no los DTO de HTTP. Así el caso de uso se puede llamar desde un controlador, desde un evento o desde una prueba.

#### Puertos

Cuando un caso de uso necesita algo que no es de su módulo, lo pide con un puerto: una clase abstracta pequeña en `application/ports` que dice exactamente lo que necesita y nada más.

```ts
export abstract class TenantChecker {
    abstract exists(tenantId: string): Promise<boolean>;
}
```

El caso de uso de categorías no sabe que existe un módulo de negocios con su repositorio; solo sabe que puede preguntar si un negocio existe. Quién responde esa pregunta se decide en infraestructura.

### 4.3 Infraestructura

Conecta el dominio con el mundo real. Aquí sí se usa NestJS, TypeORM y todo lo técnico.

#### Controladores

Son delgados. Reciben la petición, arman los parámetros y llaman al caso de uso. No validan reglas, no consultan la base y no tienen `try/catch`: los errores los maneja el filtro global.

```ts
@Post()
public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
): Promise<void> {
    await this.createCategory.execute({ ...dto, tenantId: user.tenantId });
}
```

- **El negocio siempre sale de `@CurrentUser()`**, nunca de la ruta, la query ni el cuerpo.
- Para el mensaje de éxito se usa `@ResponseMessage('...')`. Sin él, la respuesta dice "Operación exitosa."
- Lo que devuelva el método va dentro de `content`. Si devuelve un arreglo vacío o un resultado paginado sin filas, la respuesta sale como INFO con el mensaje "No se encontraron resultados."
- Si la ruta tiene que funcionar sin sesión, se marca con `@Public()`. Hoy solo lo están las de autenticación.

#### DTO

Validan la forma de lo que llega: tipos, obligatorios, longitudes. No validan reglas de negocio, eso lo hace el dominio.

```ts
export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(VALIDATION_DEFAULTS.NAME.MIN_LENGTH)
    @MaxLength(VALIDATION_DEFAULTS.NAME.MAX_LENGTH)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}
```

- El `ValidationPipe` global rechaza cualquier campo que no esté declarado, así que **todo campo que se acepte tiene que tener al menos un decorador**.
- Conviene que los límites coincidan con los del objeto de valor. Si el DTO es más flojo, el error llega igual pero desde el dominio; si es más estricto, se rechaza algo que el sistema sí permite.
- Los límites comunes están en `VALIDATION_DEFAULTS` de `@/shared`.
- **Si un campo lleva información sensible**, como una contraseña o un token, agrégalo a `SENSITIVE_FIELDS` en `src/infrastructure/logging/sanitizer.util.ts`. Si no, se escribe en claro en el log.

#### Modelos de persistencia

Son las entidades de TypeORM, en `persistence/models`. Describen la tabla tal como es y no tienen lógica.

```ts
@Entity("product_category")
export class ProductCategoryEntity {
    @PrimaryColumn({ type: "uuid" })
    id!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

    // ...
}
```

El esquema real está en los scripts de `public/db`, no en estas clases. Los índices, las restricciones únicas y las llaves foráneas se escriben en SQL. El modelo solo tiene que coincidir con la tabla.

#### Mapeadores

Traducen entre el agregado y el modelo, en los dos sentidos. Pasan siempre por `toPrimitives()` y `fromPrimitives()`. Aquí también se resuelven diferencias como `undefined` en el dominio y `null` en la base.

```ts
static toDomain(entity: ProductCategoryEntity): ProductCategory {
    return ProductCategory.fromPrimitives({
        id: entity.id,
        tenantId: entity.tenantId,
        name: entity.name,
        description: entity.description ?? undefined,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    });
}
```

#### Repositorios

Extienden la clase abstracta del dominio e implementan sus métodos con TypeORM. Reciben y devuelven agregados, nunca modelos.

Un detalle que conviene copiar: comprobar antes si un nombre ya existe no evita del todo los duplicados, porque dos peticiones al mismo tiempo pueden pasar la comprobación. El índice único de la base es quien lo impide de verdad, y el repositorio convierte ese error de Postgres (código `23505`) en la excepción de dominio:

```ts
try {
    await this.categoryRepository.insert(entity);
} catch (error) {
    if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
    ) {
        throw new ProductCategoryAlreadyExistsException(entity.name);
    }

    throw error;
}
```

Cuando una consulta de lectura es muy distinta al agregado (listados con datos de varias tablas, reportes), se puede crear un repositorio solo de lectura aparte. El módulo de movimientos de inventario lo hace con `InventoryMovementReadRepository`.

#### Adaptadores

Implementan los puertos de la capa de aplicación. Normalmente usan el repositorio o las entidades de otro módulo:

```ts
@Injectable()
export class TenantCheckerAdapter implements TenantChecker {
    constructor(private readonly tenants: TenantRepository) { }

    public async exists(tenantId: string): Promise<boolean> {
        const tenant = await this.tenants.searchById(TenantId.create(tenantId));
        return tenant !== null;
    }
}
```

### 4.4 El archivo del módulo

Es donde se unen las piezas. Tiene cuatro partes:

```ts
@Module({
    imports: [
        TypeOrmModule.forFeature([ProductCategoryEntity]),
        TenantModule,
    ],

    controllers: [CategoryController],

    providers: [
        TenantCheckerAdapter,

        { provide: ProductCategoryRepository, useClass: ProductCategoryRepositoryImpl },
        { provide: TenantChecker, useExisting: TenantCheckerAdapter },

        {
            provide: CreateCategoryUseCase,
            useFactory: (repository: ProductCategoryRepository, tenantChecker: TenantChecker) =>
                new CreateCategoryUseCase(repository, tenantChecker),
            inject: [ProductCategoryRepository, TenantChecker],
        },
    ],

    exports: [TypeOrmModule, ProductCategoryRepository],
})
export class CategoriesModule { }
```

- **imports**: los modelos del módulo con `TypeOrmModule.forFeature`, y los módulos de los que dependen sus adaptadores.
- **controllers**: los controladores.
- **providers**:
  - Cada repositorio y cada puerto se registran usando la clase abstracta como token. Así el caso de uso pide `ProductCategoryRepository` y recibe `ProductCategoryRepositoryImpl` sin saberlo.
  - Cada caso de uso se construye con `useFactory`. **El orden de `inject` tiene que ser el mismo que el de los parámetros de la factory.** Si se invierten dos del mismo tipo aparente, compila bien y falla en ejecución.
  - `useClass` crea una instancia nueva. `useExisting` reutiliza un proveedor ya registrado, y hace falta registrar también el adaptador suelto en la lista.
- **exports**: lo que otros módulos pueden usar. Normalmente el repositorio abstracto y `TypeOrmModule`.

Si el caso de uso publica eventos, registra también `{ provide: EventPublisher, useClass: EventEmitterPublisher }`.

Un módulo nuevo tiene que importarse en `src/app.module.ts`, salvo que ya lo importe otro módulo que sí esté ahí.

---

## 5. Qué puede importar a qué

| Capa | Puede importar de |
|---|---|
| Dominio | `@/shared` y su propio dominio |
| Aplicación | Su dominio, `@/shared`, `@/interfaces` y, cuando hace falta, excepciones o tipos del dominio de otro módulo |
| Infraestructura | Todo lo anterior, NestJS, TypeORM, `@/infrastructure`, `@/auth/infrastructure` y el dominio de otros módulos |
| Módulo | Todo |

Nunca al revés: el dominio no importa de aplicación, y ninguno de los dos importa de infraestructura.

Para importar se usa el alias `@/`, que apunta a `src/`. Dentro del mismo módulo también se usan rutas relativas.

---

## 6. Comunicación entre módulos

Hay dos formas, y cuál usar depende de quién necesita qué.

### 6.1 Cuando un módulo necesita preguntarle algo a otro

Se usa un puerto y un adaptador. Es una llamada directa y el que pregunta espera la respuesta para seguir.

Por ejemplo, para crear un producto hay que saber si su categoría y sus insumos existen:

1. En `products/application/ports` se crea `ProductCategoryChecker` con el método `existsForTenant(tenantId, categoryId)`.
2. En `products/infrastructure/persistence/adapters` se crea el adaptador que lo implementa consultando las categorías.
3. En `products.module.ts` se importa `CategoriesModule` (o se registra su entidad con `forFeature`) y se enlaza el puerto con el adaptador.

El puerto se define en el módulo que pregunta, con el nombre y la forma que a él le sirven. Así, si el otro módulo cambia por dentro, solo hay que tocar el adaptador.

### 6.2 Cuando a un módulo le interesa enterarse de algo que pasó en otro

Se usan eventos de dominio. El que publica no sabe quién escucha, ni siquiera si alguien escucha.

Así funciona la bitácora de inventario:

1. El agregado de inventario registra `StockReceivedEvent` al recibir mercancía.
2. `ReceiveStockUseCase` guarda y después publica los eventos con `EventPublisher`.
3. En `inventory-movements`, la clase `StockMovementHandlers` escucha ese nombre y llama a su propio caso de uso:

   ```ts
   @Injectable()
   export class StockMovementHandlers {
       constructor(private readonly recordMovement: RecordMovementUseCase) { }

       @OnEvent('inventory.stock.received')
       public async onStockReceived(event: StockReceivedEvent): Promise<void> {
           // arma los parámetros y llama a recordMovement.execute(...)
       }
   }
   ```

4. La clase de handlers se registra como proveedor en el módulo que escucha.

Hay que tener en cuenta:

- Los eventos se publican dentro del mismo proceso, justo después de guardar. No hay cola ni reintentos.
- Si un handler falla, `EventEmitterPublisher` lo escribe en el log con el contenido del evento y la petición original responde bien igual, porque la operación sí se guardó. Lo que quedó sin hacer se puede rehacer a mano con ese log.
- Por lo mismo, un handler no debe usarse para algo que tenga que pasar sí o sí junto con la operación. Eso va dentro del mismo caso de uso.
- Importa las clases de eventos por su ruta directa (`@/context/inventory/domain/events/stock-received.event`) y no desde el barrel del módulo. Más abajo se explica por qué.

---

## 7. Piezas transversales

### 7.1 Formato de respuesta

Toda respuesta, correcta o con error, tiene esta forma:

```json
{
  "status": "SUCCESS",
  "code": "0000",
  "httpStatus": 201,
  "message": "Producto creado exitosamente",
  "content": { },
  "traceId": "6bc800279a48"
}
```

- `status` puede ser `SUCCESS`, `INFO` o `ERROR`.
- `content` es lo que devolvió el controlador, o `null`.
- `traceId` es el mismo identificador del encabezado `X-Request-Id` y de las líneas del log.

Las respuestas correctas las arma `ResponseInterceptor` y las de error `AllExceptionsFilter`. Los dos son globales y se registran en `app.module.ts`, así que no hay que agregar nada en los controladores.

Para listados paginados, el repositorio devuelve `Paginated<T>` (`rows`, `pageNumber`, `pageSize`, `total`) y los DTO de búsqueda reciben `pageNumber` y `pageSize`.

### 7.2 Errores

| Qué se lanzó | Qué recibe el cliente |
|---|---|
| Una `DomainException` | El código, el mensaje del catálogo y el estado HTTP según su categoría |
| Un error de validación del DTO | 400 con código `1000` |
| Sin sesión o con token inválido | 401 con código `1001` |
| Una ruta que no existe | 404 con código `2000` |
| Cualquier otra cosa | 500 con código `9999` y un mensaje genérico |

El detalle técnico solo va al log. La explicación completa está en [manejo-de-errores-y-logs.md](manejo-de-errores-y-logs.md).

### 7.3 Configuración

Las variables de entorno se validan al arrancar en `src/infrastructure/config/env.validation.ts`. Si falta una obligatoria, la aplicación no inicia.

Después se agrupan en configuraciones con tipo (`database`, `cors`, `jwt`, `cookie`, `logging`), y se leen así:

```ts
const jwt = configService.getOrThrow<JwtConfig>('jwt');
```

No uses `process.env` directamente fuera de `src/infrastructure/config`. Para agregar una variable nueva:

1. Declárala con sus validaciones en `env.validation.ts`.
2. Léela y dale su valor por defecto en el archivo de configuración que corresponda, o crea uno nuevo con `registerAs` y agrégalo a `load` en `config.module.ts`.
3. Define su tipo en `src/interfaces`.
4. Documéntala en `.env.exam` y en el README.

### 7.4 Autenticación y separación entre negocios

- `AuthModule` registra dos guards globales en orden: primero `JwtAuthGuard` y después `TenantScopeGuard`, que necesita el usuario que deja el primero.
- El usuario autenticado se obtiene con `@CurrentUser()` y trae `tenantId`, `userId`, `branchId` y el alcance del rol.
- `TenantScopeGuard` revisa ruta, query y cuerpo, y rechaza la petición si encuentra un `tenantId` distinto al del token. Es una red de seguridad, no la protección principal: si un endpoint busca un recurso solo por su id, no hay nada que comparar. Por eso los repositorios siempre filtran por negocio.

---

## 8. Cómo trabajar con la arquitectura

### 8.1 Agregar un módulo nuevo

Supongamos un módulo de proveedores. El orden recomendado es de adentro hacia afuera:

1. **Base de datos.** Agrega la tabla en el script SQL que corresponda de `public/db`, con su `tenant_id`, sus índices y sus restricciones. Aplica el cambio a tu base local a mano o recreando el volumen.
2. **Dominio**, en `src/context/suppliers/domain`:
   - Un id que herede de `Uuid` (`SupplierId`), con `create` y `generate`.
   - Los objetos de valor que tengan reglas (`SupplierName`, `SupplierNit`...).
   - Las excepciones, con códigos nuevos en un rango libre.
   - El tipo de primitivos (`SupplierPrimitives`).
   - El agregado (`Supplier`) con constructor privado, `create`, `fromPrimitives`, `toPrimitives` y sus métodos de negocio.
   - El repositorio abstracto (`SupplierRepository`).
   - Un `index.ts` que exporte todo.
3. **Catálogo.** Registra los códigos nuevos en `src/shared/response-catalog.ts` con su mensaje y su categoría.
4. **Aplicación**, en `application`:
   - Los puertos que necesites hacia otros módulos.
   - Un caso de uso por acción, cada uno en su carpeta.
   - Un `index.ts`.
5. **Infraestructura**, en `infrastructure`:
   - El modelo de TypeORM, igual a la tabla.
   - El mapeador.
   - La implementación del repositorio.
   - Los adaptadores de los puertos.
   - Los DTO y el controlador.
   - Un `index.ts`.
6. **Módulo.** Crea `suppliers.module.ts` con los modelos, los enlaces de repositorio y puertos, y las factories de los casos de uso.
7. **Registro.** Importa el módulo en `src/app.module.ts`.
8. **Pruebas.** Al menos de los casos de uso y de las reglas del agregado.

Para verificar, corre `npx tsc --noEmit -p tsconfig.json` y `pnpm test`.

### 8.2 Agregar un caso de uso a un módulo existente

1. Si la acción cambia el agregado, agrega el método de negocio en el agregado con sus validaciones y excepciones.
2. Si hace falta, agrega el método nuevo al repositorio abstracto y a su implementación.
3. Crea el caso de uso en su carpeta dentro de `application/use-cases` y expórtalo en `application/index.ts`.
4. Regístralo en el módulo con `useFactory` e `inject`, en el mismo orden que su constructor.
5. Crea el DTO y el método en el controlador.
6. Registra los códigos de error nuevos en el catálogo.

### 8.3 Reaccionar a algo que pasa en otro módulo

1. Revisa si el otro módulo ya publica el evento que necesitas. Si no, agrégalo en su dominio, regístralo desde el método del agregado y asegúrate de que su caso de uso lo publique después de guardar.
2. En tu módulo crea una clase `@Injectable()` con un método `@OnEvent('nombre.del.evento')` que llame a tu caso de uso.
3. Regístrala en `providers` de tu módulo.
4. Decide qué pasa si falla. Si no debe tumbar nada, captura el error y escríbelo en el log, como hace `StockMovementHandlers`.

### 8.4 Consultar datos de otro módulo

1. Crea un puerto en tu módulo con la pregunta exacta que necesitas responder.
2. Crea el adaptador en `infrastructure/persistence/adapters`, usando el repositorio que exporta el otro módulo o registrando su entidad con `forFeature`.
3. Importa el otro módulo en el tuyo y enlaza el puerto con el adaptador.

Evita inyectar directamente el repositorio o un caso de uso de otro módulo dentro de tu caso de uso.

---

## 9. Pruebas

- Las pruebas unitarias van al lado del archivo que prueban, terminadas en `.spec.ts`.
- Los casos de uso se prueban construyéndolos a mano con dobles de sus dependencias. Como los repositorios y puertos son clases abstractas, basta con un objeto que tenga los mismos métodos hechos con `jest.fn()`:

  ```ts
  const update = jest.fn().mockResolvedValue(undefined);

  const useCase = new LogoutUseCase(
      {
          create: jest.fn(),
          update,
          findByRefreshTokenHash: jest.fn().mockResolvedValue(session),
          findById: jest.fn(),
          revokeAllByUser: jest.fn(),
          rotate: jest.fn(),
      },
      { generate: jest.fn(), hash: jest.fn().mockReturnValue(HASH) },
  );
  ```

- Los agregados y objetos de valor se prueban directamente, sin ningún doble.
- Las pruebas de punta a punta van en `test/` y levantan solo los controladores y guards que necesitan, con los casos de uso reemplazados.

Para correrlas:

```bash
pnpm test
pnpm test -- src/auth/application/use-cases/logout/logout.use-case.spec.ts
pnpm test:e2e
```

---

## 10. Detalles que suelen causar problemas

- **Barrels y `@nestjs/jwt`.** Importar desde el `index.ts` de un módulo trae todo lo que exporta, incluido su controlador, y con él `@nestjs/jwt`. Esa librería solo se publica como ESM y Jest no la puede cargar. En pruebas unitarias, y en archivos que se prueban de forma aislada como los handlers de eventos, importa por ruta directa. En las pruebas de punta a punta se simula con `jest.mock('@nestjs/jwt', ...)`.
- **Dependencias circulares.** Lo mismo pasa dentro de `src/infrastructure`: algunos archivos importan por ruta directa en lugar de `@/infrastructure` porque el barrel exporta también el módulo de base de datos. Si al arrancar aparece un proveedor `undefined`, sospecha de un barrel.
- **Orden de `inject`.** Tiene que coincidir con el de la factory. Si no, el caso de uso recibe una dependencia en el lugar de otra.
- **Código de error sin registrar.** La excepción funciona, pero el cliente recibe un 500 con `9999`.
- **Campos opcionales.** El proyecto usa `exactOptionalPropertyTypes`, así que no se puede pasar `undefined` a una propiedad opcional. Se agrega la clave solo cuando hay valor:

  ```ts
  ...(profitMargin !== undefined ? { profitMargin: ProfitMargin.create(profitMargin.toString()) } : {})
  ```

- **Acceso por índice.** Con `noUncheckedIndexedAccess`, `lista[0]` puede ser `undefined` y hay que comprobarlo antes de usarlo.
- **`tenantId` desde el cliente.** No lo pongas en DTO, rutas ni query de endpoints nuevos. Tómalo del token.
- **Esquema.** Un cambio en un modelo de TypeORM no cambia la tabla. Hay que escribirlo en `public/db`.
- **Datos sensibles en el log.** Cualquier campo sensible nuevo en un DTO va en `SENSITIVE_FIELDS`.

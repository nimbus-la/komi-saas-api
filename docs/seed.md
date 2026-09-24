# Datos de prueba (seed)

La API tiene un endpoint que llena la base con datos de prueba: cinco negocios, cada uno con sus sucursales, usuarios de todos los roles, insumos con existencias, categorías y productos con receta. Cuatro son pequeños y uno, Crepería La Alameda, tiene un catálogo grande para probar paginación, filtros y búsquedas con volumen. Sirve para probar el front y los endpoints sin tener que crear todo a mano.

## Solo existe en desarrollo

El módulo del seed se carga únicamente cuando `NODE_ENV=development`. Con `production` o `test` el módulo no se registra y `POST /seed` responde 404, igual que cualquier ruta que no existe.

La condición está en `src/app.module.ts`, con `ConditionalModule` de `@nestjs/config`. Se hizo así y no con un guard porque el endpoint borra datos. Si la ruta no existe en producción, ningún cambio en los guards puede dejarla abierta por error.

## Cómo usarlo

Con la base y la API arriba (`docker compose up -d` y `pnpm start:dev`):

```bash
curl -X POST http://localhost:3000/seed
```

Cambia el puerto si en tu `.env` tienes otro valor en `PORT`.

La ruta no pide sesión. En una base recién creada no hay ningún usuario con el que iniciarla, y el seed es justamente lo que los crea.

Tarda unos pocos segundos. La respuesta trae, por cada negocio, su slug, sus sucursales, los nombres de usuario creados y cuántos insumos y productos quedaron:

```json
{
  "status": "SUCCESS",
  "code": "0000",
  "message": "Datos de prueba creados exitosamente",
  "content": [
    {
      "name": "Sabor Criollo",
      "slug": "sabor-criollo",
      "branches": ["Centro", "Laureles", "Envigado"],
      "users": ["carlos.restrepo", "diana.cardona", "jorge.mejia", "laura.gomez", "..."],
      "inventoryItems": 9,
      "products": 5
    }
  ]
}
```

## Qué crea

### Negocios y sucursales

| Negocio | Slug | Sucursales |
|---|---|---|
| Sabor Criollo | `sabor-criollo` | Centro, Laureles, Envigado |
| La Parrilla del Puerto | `la-parrilla-del-puerto` | Alto Prado, Malecón |
| Café Montaña | `cafe-montana` | Cable, Chipre |
| Arepas Doña Rosa | `arepas-dona-rosa` | Chapinero |
| Crepería La Alameda | `creperia-la-alameda` | 16 sedes en 10 ciudades (ver abajo) |

Arepas Doña Rosa tiene una sola sucursal a propósito, para probar cómo se comporta la aplicación con un negocio de una sola sede.

Crepería La Alameda es el negocio grande: 16 sucursales, 51 usuarios, 76 insumos, 12 categorías y 93 productos. Sus sedes están repartidas por el país:

| Ciudad | Sucursales |
|---|---|
| Bogotá | Usaquén, Parque 93, Salitre, Chapinero |
| Cali | Granada, Ciudad Jardín, Chipichape, San Fernando |
| Palmira | Palmira |
| Medellín | El Poblado |
| Barranquilla | Buenavista |
| Cartagena | Bocagrande |
| Bucaramanga | Cabecera |
| Pereira | Circunvalar |
| Manizales | Cable |
| Santa Marta | El Rodadero |

### Usuarios

Cada negocio tiene un dueño, un administrador y un supervisor, que son roles administrativos y no pertenecen a ninguna sucursal. Además, cada sucursal tiene un cajero, un mesero y una persona de cocina.

Las personas son inventadas, pero con datos creíbles: nombres y apellidos completos, correo, celular y fecha de nacimiento. El nombre de usuario es el primer nombre y el primer apellido, en minúsculas, sin tildes y separados por un punto. El correo sigue la misma forma con un dominio común, por ejemplo `carlos.restrepo@gmail.com`.

Todos los usuarios tienen la contraseña `Komi12345678`.

**Sabor Criollo** (`sabor-criollo`)

| Rol | Sucursal | Usuario | Nombre |
|---|---|---|---|
| Dueño | | `carlos.restrepo` | Carlos Andrés Restrepo Uribe |
| Administrador | | `diana.cardona` | Diana Marcela Cardona Villa |
| Supervisor | | `jorge.mejia` | Jorge Iván Mejía Ochoa |
| Cajero | Centro | `laura.gomez` | Laura Cristina Gómez Álvarez |
| Mesero | Centro | `andres.ruiz` | Andrés Felipe Ruiz Montoya |
| Cocina | Centro | `marta.diaz` | Marta Lucía Díaz Posada |
| Cajero | Laureles | `sofia.arango` | Sofía Arango Betancur |
| Mesero | Laureles | `juan.osorio` | Juan Felipe Osorio Londoño |
| Cocina | Laureles | `luis.zapata` | Luis Alberto Zapata Correa |
| Cajero | Envigado | `paula.velez` | Paula Andrea Vélez Rendón |
| Mesero | Envigado | `camilo.henao` | Camilo Henao Gil |
| Cocina | Envigado | `rosa.castano` | Rosa Elena Castaño Muñoz |

**La Parrilla del Puerto** (`la-parrilla-del-puerto`)

| Rol | Sucursal | Usuario | Nombre |
|---|---|---|---|
| Dueño | | `ricardo.barrios` | Ricardo José Barrios Consuegra |
| Administrador | | `natalia.pertuz` | Natalia Pertuz Charris |
| Supervisor | | `hernan.charris` | Hernán Darío Charris Molina |
| Cajero | Alto Prado | `yuliana.mendoza` | Yuliana Mendoza Ariza |
| Mesero | Alto Prado | `kevin.orozco` | Kevin Andrés Orozco Rada |
| Cocina | Alto Prado | `wilson.polo` | Wilson Enrique Polo Barraza |
| Cajero | Malecón | `karen.ospino` | Karen Julieth Ospino Gutiérrez |
| Mesero | Malecón | `jesus.maestre` | Jesús David Maestre Pinto |
| Cocina | Malecón | `ana.fontalvo` | Ana Milena Fontalvo Rojano |

**Café Montaña** (`cafe-montana`)

| Rol | Sucursal | Usuario | Nombre |
|---|---|---|---|
| Dueño | | `valentina.giraldo` | Valentina Giraldo Arias |
| Administrador | | `mateo.salazar` | Mateo Alejandro Salazar Duque |
| Supervisor | | `lorena.ocampo` | Lorena Patricia Ocampo Franco |
| Cajero | Cable | `daniela.marin` | Daniela Marín Quintero |
| Mesero | Cable | `santiago.toro` | Santiago Toro Valencia |
| Cocina | Cable | `oscar.ramirez` | Óscar Mauricio Ramírez Hoyos |
| Cajero | Chipre | `juliana.loaiza` | Juliana Loaiza Cardona |
| Mesero | Chipre | `tomas.echeverri` | Tomás Echeverri Ríos |
| Cocina | Chipre | `gloria.aristizabal` | Gloria Inés Aristizábal Gallego |

**Arepas Doña Rosa** (`arepas-dona-rosa`)

| Rol | Sucursal | Usuario | Nombre |
|---|---|---|---|
| Dueño | | `rosa.pardo` | Rosa María Pardo Cely |
| Administrador | | `miguel.pardo` | Miguel Ángel Pardo Cely |
| Supervisor | | `clara.rincon` | Clara Inés Rincón Forero |
| Cajero | Chapinero | `liliana.suarez` | Liliana Suárez Bernal |
| Mesero | Chapinero | `brayan.castro` | Brayan Stiven Castro Moreno |
| Cocina | Chapinero | `edgar.rojas` | Edgar Rojas Peña |

**Crepería La Alameda** (`creperia-la-alameda`)

| Rol | Sucursal | Usuario | Nombre |
|---|---|---|---|
| Dueño | | `mariana.londono` | Mariana Londoño Restrepo |
| Administrador | | `felipe.acosta` | Felipe Andrés Acosta Rueda |
| Supervisor | | `catalina.herrera` | Catalina Herrera Pinzón |
| Cajero | Usaquén (Bogotá) | `manuela.bermudez` | Manuela Bermúdez Ortiz |
| Mesero | Usaquén (Bogotá) | `sebastian.vargas` | Sebastián Vargas Caicedo |
| Cocina | Usaquén (Bogotá) | `gustavo.pinilla` | Gustavo Adolfo Pinilla Rozo |
| Cajero | Parque 93 (Bogotá) | `alejandra.nino` | Alejandra Niño Beltrán |
| Mesero | Parque 93 (Bogotá) | `david.cardenas` | David Esteban Cárdenas Mora |
| Cocina | Parque 93 (Bogotá) | `yolanda.cortes` | Yolanda Cortés Jiménez |
| Cajero | Salitre (Bogotá) | `julian.pena` | Julián Peña Sierra |
| Mesero | Salitre (Bogotá) | `nicolas.rincon` | Nicolás Rincón Garzón |
| Cocina | Salitre (Bogotá) | `patricia.moreno` | Patricia Moreno Salcedo |
| Cajero | Chapinero (Bogotá) | `laura.castillo` | Laura Castillo Rubiano |
| Mesero | Chapinero (Bogotá) | `andres.quintero` | Andrés Quintero Bohórquez |
| Cocina | Chapinero (Bogotá) | `jairo.munoz` | Jairo Muñoz Ávila |
| Cajero | Granada (Cali) | `valeria.rengifo` | Valeria Rengifo Lozano |
| Mesero | Granada (Cali) | `jhon.mosquera` | Jhon Fredy Mosquera Riascos |
| Cocina | Granada (Cali) | `luz.caicedo` | Luz Dary Caicedo Hurtado |
| Cajero | Ciudad Jardín (Cali) | `isabella.cabal` | Isabella Cabal Holguín |
| Mesero | Ciudad Jardín (Cali) | `esteban.velasco` | Esteban Velasco Borrero |
| Cocina | Ciudad Jardín (Cali) | `hector.lasso` | Héctor Fabio Lasso Arboleda |
| Cajero | Chipichape (Cali) | `daniela.ocampo` | Daniela Ocampo Varela |
| Mesero | Chipichape (Cali) | `cristian.angulo` | Cristian Camilo Angulo Valencia |
| Cocina | Chipichape (Cali) | `marleny.garcia` | Marleny García Cuero |
| Cajero | San Fernando (Cali) | `angie.zuniga` | Angie Paola Zúñiga Mejía |
| Mesero | San Fernando (Cali) | `miguel.otero` | Miguel Otero Paz |
| Cocina | San Fernando (Cali) | `fernando.escobar` | Fernando Escobar Llanos |
| Cajero | Palmira (Palmira) | `yesica.saavedra` | Yésica Saavedra Potes |
| Mesero | Palmira (Palmira) | `diego.victoria` | Diego Alejandro Victoria Rojas |
| Cocina | Palmira (Palmira) | `blanca.ramos` | Blanca Nubia Ramos Candelo |
| Cajero | El Poblado (Medellín) | `susana.jaramillo` | Susana Jaramillo Botero |
| Mesero | El Poblado (Medellín) | `mateo.gaviria` | Mateo Gaviria Posada |
| Cocina | El Poblado (Medellín) | `alba.munera` | Alba Lucía Múnera Tobón |
| Cajero | Buenavista (Barranquilla) | `keila.delahoz` | Keila De la Hoz Palacio |
| Mesero | Buenavista (Barranquilla) | `luis.barraza` | Luis Carlos Barraza Ahumada |
| Cocina | Buenavista (Barranquilla) | `edilberto.cantillo` | Edilberto Cantillo Meza |
| Cajero | Bocagrande (Cartagena) | `shirley.julio` | Shirley Julio Cassiani |
| Mesero | Bocagrande (Cartagena) | `andres.marrugo` | Andrés Marrugo Pájaro |
| Cocina | Bocagrande (Cartagena) | `carmen.torres` | Carmen Torres Blanco |
| Cajero | Cabecera (Bucaramanga) | `paola.duarte` | Paola Duarte Serrano |
| Mesero | Cabecera (Bucaramanga) | `sergio.gomez` | Sergio Gómez Rueda |
| Cocina | Cabecera (Bucaramanga) | `orlando.jaimes` | Orlando Jaimes Plata |
| Cajero | Circunvalar (Pereira) | `melissa.arias` | Melissa Arias Cardona |
| Mesero | Circunvalar (Pereira) | `juan.valencia` | Juan Pablo Valencia Soto |
| Cocina | Circunvalar (Pereira) | `amparo.grajales` | Amparo Grajales López |
| Cajero | Cable (Manizales) | `sara.henao` | Sara Henao Castaño |
| Mesero | Cable (Manizales) | `samuel.giraldo` | Samuel Giraldo Ospina |
| Cocina | Cable (Manizales) | `ruben.cardona` | Rubén Darío Cardona Arango |
| Cajero | El Rodadero (Santa Marta) | `dayana.pacheco` | Dayana Pacheco Vives |
| Mesero | El Rodadero (Santa Marta) | `jose.daza` | José Daza Pinedo |
| Cocina | El Rodadero (Santa Marta) | `eduardo.linero` | Eduardo Linero Noguera |

Para iniciar sesión se envía el slug del negocio junto con el usuario:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug": "sabor-criollo", "username": "carlos.restrepo", "password": "Komi12345678"}'
```

### Inventario

Los negocios pequeños tienen entre seis y nueve insumos, y Crepería La Alameda tiene 76. Hay unidades en gramos, mililitros y unidades, y perecederos y no perecederos.

- Cada sucursal recibe un lote de cada insumo. Los perecederos vencen unos días después de la fecha en que se corre el seed, así que los lotes siempre quedan vigentes.
- La mayoría de los insumos tiene mínimo global. Los negocios con varias sucursales tienen además un insumo con un mínimo propio en una de ellas.
- Algunos insumos quedan por debajo de su mínimo desde el principio, para que se vean las alertas de stock bajo. Por ejemplo, el plátano maduro de Sabor Criollo, la costilla de cerdo de La Parrilla del Puerto, o el queso azul, el salmón ahumado, el helado de fresa y la caja para llevar de Crepería La Alameda. En esta última, el huevo solo queda bajo el mínimo en Parque 93, que tiene un mínimo propio más alto.
- Cada lote genera su movimiento de entrada en la bitácora de `inventory-movements`, igual que una recepción hecha desde la API.

### Categorías y productos

Los negocios pequeños tienen tres categorías y entre cuatro y cinco productos. Crepería La Alameda tiene 12 categorías (entradas, crepes de sal y de dulce, waffles, ensaladas, pitas y paninis, pizzetas, helados y postres, malteadas, bebidas calientes, bebidas frías y para llevar) con 93 productos, entre cuatro y doce por categoría. Cada producto tiene una receta con insumos de su mismo negocio, y algunos ingredientes están marcados como opcionales. En Crepería La Alameda hay dos insumos que no aparecen en ninguna receta (azúcar morena y chips de chocolate), para probar insumos sin uso.

## Qué pasa si lo llamas otra vez

Antes de crear, el seed borra los negocios de prueba con todo lo que depende de ellos: sesiones, movimientos, recetas, productos, categorías, mínimos por sucursal, lotes, insumos, usuarios y sucursales. Después los crea de nuevo. Por eso puedes llamarlo las veces que quieras y siempre queda el mismo conjunto de datos.

Hay que tener en cuenta tres cosas:

- Solo se borran los negocios cuyo slug aparece en el archivo de datos. Los demás negocios de la base no se tocan.
- Los ids cambian en cada llamada. Si el front o alguna prueba guardó un id, hay que volver a consultarlo.
- Los SKU de insumos y productos siguen avanzando, porque las secuencias de la base no se reinician. Después de varias llamadas los SKU ya no empiezan en 0001.

El borrado va en una transacción. La creación no, porque cada repositorio guarda por su cuenta. Si algo falla a mitad de camino, quedan algunos datos creados, y basta con volver a llamar el endpoint para que se borren y se creen completos.

## Cómo cambiar los datos

Los datos están en `src/context/seed/application/data/seed.data.ts`, separados de la lógica. Crepería La Alameda, por su tamaño, está en su propio archivo, `creperia-la-alameda.data.ts`, y `seed.data.ts` lo agrega a la lista. Para agregar un insumo, un producto o una sucursal, se edita el archivo del negocio y no hace falta tocar nada más.

En `creperia-la-alameda.data.ts` las masas de crepe, waffle y pizzeta están definidas una vez (`CREPE_BASE`, `WAFFLE_BASE`, `PIZZETA_BASE`) y las recetas las reutilizan. Una receta no puede repetir un insumo, así que si agregas a una de esas recetas un insumo que ya está en la masa, el seed falla.

- Las recetas nombran sus insumos por el nombre del insumo, y los mínimos por sucursal nombran la sucursal por su nombre. Si escribes un nombre que no existe en el mismo negocio, el seed falla con un mensaje que dice cuál referencia no encontró.
- Los valores pasan por los mismos objetos de valor que usa la API. Un teléfono muy corto o una contraseña sin mayúsculas se rechazan igual que en un endpoint normal.
- El nombre de usuario no acepta tildes ni eñes, solo letras sin acento, números, punto, guion y guion bajo. Por eso `Castaño` queda como `rosa.castano`. El usuario y el correo no se pueden repetir dentro del mismo negocio.
- Si agregas o cambias un usuario, actualiza también la tabla de usuarios de este documento.
- Si cambias el slug de un negocio, el negocio con el slug anterior deja de borrarse en las siguientes llamadas. Tendrás que borrarlo a mano o recrear el volumen de Docker.
- El NIT de cada negocio tiene que ser distinto al de cualquier otro negocio de la base, incluidos los que no son de prueba.

## Cómo está armado

El módulo sigue la misma estructura que los demás (ver [arquitectura.md](arquitectura.md)):

- `application/data/seed.data.ts`: los datos.
- `application/data/creperia-la-alameda.data.ts`: los datos del negocio grande.
- `application/ports/seed-data-cleaner.ts`: el puerto para borrar los negocios de prueba.
- `application/use-cases/run-seed/run-seed.use-case.ts`: el caso de uso que borra y crea.
- `infrastructure/persistence/adapters/typeorm-seed-data-cleaner.adapter.ts`: el borrado en SQL.
- `infrastructure/http/seed.controller.ts`: el endpoint.

El caso de uso no llama a los casos de uso de creación de cada módulo, porque esos no devuelven el id de lo que crean y aquí cada paso necesita el id del anterior. Lo que hace es construir cada cosa con la fábrica de su agregado y guardarla con el repositorio que exporta su módulo. Así las validaciones del dominio se aplican igual. Por esta razón `ProductsModule` exporta `ProductRepository` y `UserModule` exporta `PasswordHasher`.

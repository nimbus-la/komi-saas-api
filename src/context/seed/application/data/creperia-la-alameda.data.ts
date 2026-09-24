import type { SeedRecipeIngredient, SeedTenant } from './seed.data';


/**
 * Negocio grande de crepes, waffles y helados. Tiene muchos insumos y productos
 * para probar paginación, filtros y búsquedas con volumen, a diferencia de los
 * otros negocios del seed, que son pequeños.
 *
 * Tiene dieciséis sedes repartidas por el país (cuatro en Bogotá, cuatro en
 * Cali, una en Palmira y una en cada una de otras siete ciudades), cada una con
 * cajero, mesero y cocina, para probar listados de sucursales y de usuarios.
 */


/** Masa de una crepe. Casi todas las crepes empiezan con ella. */
const CREPE_BASE: SeedRecipeIngredient[] = [
    { item: 'Harina de trigo', quantity: '60' },
    { item: 'Huevo', quantity: '1' },
    { item: 'Leche entera', quantity: '120' },
];


/** Masa de un waffle. */
const WAFFLE_BASE: SeedRecipeIngredient[] = [
    { item: 'Harina de trigo', quantity: '90' },
    { item: 'Huevo', quantity: '1' },
    { item: 'Leche entera', quantity: '100' },
    { item: 'Mantequilla', quantity: '20' },
    { item: 'Polvo para hornear', quantity: '5' },
    { item: 'Azúcar blanca', quantity: '15' },
];


/** Masa de una pizzeta. */
const PIZZETA_BASE: SeedRecipeIngredient[] = [
    { item: 'Harina de trigo', quantity: '120' },
    { item: 'Sal refinada', quantity: '3' },
    { item: 'Aceite de oliva', quantity: '10' },
];


export const CREPERIA_LA_ALAMEDA: SeedTenant = {
    name: 'Crepería La Alameda',
    description: 'Restaurante de crepes, waffles y helados con dieciséis sedes en Colombia.',
    slug: 'creperia-la-alameda',
    nit: '900555105-5',
    administrators: [
        { rol: 'OWNER', userName: 'mariana.londono', email: 'mariana.londono@gmail.com', firstName: 'Mariana', firstLastName: 'Londoño', secondLastName: 'Restrepo', sex: 'FEMALE', birthDate: '1978-05-14', phone: '3105521847' },
        { rol: 'ADMIN', userName: 'felipe.acosta', email: 'felipe.acosta@outlook.com', firstName: 'Felipe', secondName: 'Andrés', firstLastName: 'Acosta', secondLastName: 'Rueda', sex: 'MALE', birthDate: '1986-11-23', phone: '3162287045' },
        { rol: 'SUPERVISOR', userName: 'catalina.herrera', email: 'catalina.herrera@gmail.com', firstName: 'Catalina', firstLastName: 'Herrera', secondLastName: 'Pinzón', sex: 'FEMALE', birthDate: '1991-03-02', phone: '3009914762' },
    ],
    branches: [
        // Bogotá
        {
            name: 'Usaquén', address: 'Carrera 6 # 119-24', phone: '6017450001', city: 'Bogotá', department: 'Cundinamarca',
            staff: [
                { rol: 'CASHIER', userName: 'manuela.bermudez', email: 'manuela.bermudez@gmail.com', firstName: 'Manuela', firstLastName: 'Bermúdez', secondLastName: 'Ortiz', sex: 'FEMALE', birthDate: '1999-08-17', phone: '3214478390' },
                { rol: 'WAITER', userName: 'sebastian.vargas', email: 'sebastian.vargas@hotmail.com', firstName: 'Sebastián', firstLastName: 'Vargas', secondLastName: 'Caicedo', sex: 'MALE', birthDate: '2001-06-09', phone: '3057718264' },
                { rol: 'KITCHEN', userName: 'gustavo.pinilla', email: 'gustavo.pinilla@gmail.com', firstName: 'Gustavo', secondName: 'Adolfo', firstLastName: 'Pinilla', secondLastName: 'Rozo', sex: 'MALE', birthDate: '1982-01-30', phone: '3128843710' },
            ],
        },
        {
            name: 'Parque 93', address: 'Calle 93A # 13-40', phone: '6017450002', city: 'Bogotá', department: 'Cundinamarca',
            staff: [
                { rol: 'CASHIER', userName: 'alejandra.nino', email: 'alejandra.nino@gmail.com', firstName: 'Alejandra', firstLastName: 'Niño', secondLastName: 'Beltrán', sex: 'FEMALE', birthDate: '1998-12-12', phone: '3046692185' },
                { rol: 'WAITER', userName: 'david.cardenas', email: 'david.cardenas@outlook.com', firstName: 'David', secondName: 'Esteban', firstLastName: 'Cárdenas', secondLastName: 'Mora', sex: 'MALE', birthDate: '2000-10-25', phone: '3183390527' },
                { rol: 'KITCHEN', userName: 'yolanda.cortes', email: 'yolanda.cortes@hotmail.com', firstName: 'Yolanda', firstLastName: 'Cortés', secondLastName: 'Jiménez', sex: 'FEMALE', birthDate: '1977-04-19', phone: '3112265904' },
            ],
        },
        {
            name: 'Salitre', address: 'Avenida Calle 24 # 68-50', phone: '6017450003', city: 'Bogotá', department: 'Cundinamarca',
            staff: [
                { rol: 'CASHIER', userName: 'julian.pena', email: 'julian.pena@gmail.com', firstName: 'Julián', firstLastName: 'Peña', secondLastName: 'Sierra', sex: 'MALE', birthDate: '1997-07-07', phone: '3225530618' },
                { rol: 'WAITER', userName: 'nicolas.rincon', email: 'nicolas.rincon@gmail.com', firstName: 'Nicolás', firstLastName: 'Rincón', secondLastName: 'Garzón', sex: 'MALE', birthDate: '2002-02-14', phone: '3017734925' },
                { rol: 'KITCHEN', userName: 'patricia.moreno', email: 'patricia.moreno@hotmail.com', firstName: 'Patricia', firstLastName: 'Moreno', secondLastName: 'Salcedo', sex: 'FEMALE', birthDate: '1980-09-03', phone: '3136621847' },
            ],
        },
        {
            name: 'Chapinero', address: 'Carrera 7 # 60-12', phone: '6017450004', city: 'Bogotá', department: 'Cundinamarca',
            staff: [
                { rol: 'CASHIER', userName: 'laura.castillo', email: 'laura.castillo@gmail.com', firstName: 'Laura', firstLastName: 'Castillo', secondLastName: 'Rubiano', sex: 'FEMALE', birthDate: '1998-04-22', phone: '3204418763' },
                { rol: 'WAITER', userName: 'andres.quintero', email: 'andres.quintero@outlook.com', firstName: 'Andrés', firstLastName: 'Quintero', secondLastName: 'Bohórquez', sex: 'MALE', birthDate: '2001-11-08', phone: '3052297314' },
                { rol: 'KITCHEN', userName: 'jairo.munoz', email: 'jairo.munoz@gmail.com', firstName: 'Jairo', firstLastName: 'Muñoz', secondLastName: 'Ávila', sex: 'MALE', birthDate: '1979-06-15', phone: '3118830562' },
            ],
        },
        // Cali
        {
            name: 'Granada', address: 'Avenida 9 Norte # 15-30', phone: '6027450005', city: 'Cali', department: 'Valle del Cauca',
            staff: [
                { rol: 'CASHIER', userName: 'valeria.rengifo', email: 'valeria.rengifo@gmail.com', firstName: 'Valeria', firstLastName: 'Rengifo', secondLastName: 'Lozano', sex: 'FEMALE', birthDate: '1999-01-19', phone: '3164450928' },
                { rol: 'WAITER', userName: 'jhon.mosquera', email: 'jhon.mosquera@hotmail.com', firstName: 'Jhon', secondName: 'Fredy', firstLastName: 'Mosquera', secondLastName: 'Riascos', sex: 'MALE', birthDate: '2000-03-27', phone: '3187726041' },
                { rol: 'KITCHEN', userName: 'luz.caicedo', email: 'luz.caicedo@gmail.com', firstName: 'Luz', secondName: 'Dary', firstLastName: 'Caicedo', secondLastName: 'Hurtado', sex: 'FEMALE', birthDate: '1976-10-11', phone: '3155508734' },
            ],
        },
        {
            name: 'Ciudad Jardín', address: 'Carrera 105 # 16-50', phone: '6027450006', city: 'Cali', department: 'Valle del Cauca',
            staff: [
                { rol: 'CASHIER', userName: 'isabella.cabal', email: 'isabella.cabal@gmail.com', firstName: 'Isabella', firstLastName: 'Cabal', secondLastName: 'Holguín', sex: 'FEMALE', birthDate: '2001-05-30', phone: '3016649281' },
                { rol: 'WAITER', userName: 'esteban.velasco', email: 'esteban.velasco@outlook.com', firstName: 'Esteban', firstLastName: 'Velasco', secondLastName: 'Borrero', sex: 'MALE', birthDate: '2002-08-12', phone: '3228814506' },
                { rol: 'KITCHEN', userName: 'hector.lasso', email: 'hector.lasso@gmail.com', firstName: 'Héctor', secondName: 'Fabio', firstLastName: 'Lasso', secondLastName: 'Arboleda', sex: 'MALE', birthDate: '1981-12-01', phone: '3127739054' },
            ],
        },
        {
            name: 'Chipichape', address: 'Calle 38 Norte # 6N-35', phone: '6027450007', city: 'Cali', department: 'Valle del Cauca',
            staff: [
                { rol: 'CASHIER', userName: 'daniela.ocampo', email: 'daniela.ocampo@hotmail.com', firstName: 'Daniela', firstLastName: 'Ocampo', secondLastName: 'Varela', sex: 'FEMALE', birthDate: '1997-02-06', phone: '3148851207' },
                { rol: 'WAITER', userName: 'cristian.angulo', email: 'cristian.angulo@gmail.com', firstName: 'Cristian', secondName: 'Camilo', firstLastName: 'Angulo', secondLastName: 'Valencia', sex: 'MALE', birthDate: '1999-09-18', phone: '3203367412' },
                { rol: 'KITCHEN', userName: 'marleny.garcia', email: 'marleny.garcia@gmail.com', firstName: 'Marleny', firstLastName: 'García', secondLastName: 'Cuero', sex: 'FEMALE', birthDate: '1974-07-23', phone: '3175524190' },
            ],
        },
        {
            name: 'San Fernando', address: 'Calle 5 # 34-20', phone: '6027450008', city: 'Cali', department: 'Valle del Cauca',
            staff: [
                { rol: 'CASHIER', userName: 'angie.zuniga', email: 'angie.zuniga@gmail.com', firstName: 'Angie', secondName: 'Paola', firstLastName: 'Zúñiga', secondLastName: 'Mejía', sex: 'FEMALE', birthDate: '2000-12-03', phone: '3045518836' },
                { rol: 'WAITER', userName: 'miguel.otero', email: 'miguel.otero@hotmail.com', firstName: 'Miguel', firstLastName: 'Otero', secondLastName: 'Paz', sex: 'MALE', birthDate: '2003-01-25', phone: '3196630487' },
                { rol: 'KITCHEN', userName: 'fernando.escobar', email: 'fernando.escobar@outlook.com', firstName: 'Fernando', firstLastName: 'Escobar', secondLastName: 'Llanos', sex: 'MALE', birthDate: '1983-03-14', phone: '3102249875' },
            ],
        },
        // Palmira
        {
            name: 'Palmira', address: 'Calle 31 # 28-45', phone: '6027450009', city: 'Palmira', department: 'Valle del Cauca',
            staff: [
                { rol: 'CASHIER', userName: 'yesica.saavedra', email: 'yesica.saavedra@gmail.com', firstName: 'Yésica', firstLastName: 'Saavedra', secondLastName: 'Potes', sex: 'FEMALE', birthDate: '1998-06-29', phone: '3167712045' },
                { rol: 'WAITER', userName: 'diego.victoria', email: 'diego.victoria@gmail.com', firstName: 'Diego', secondName: 'Alejandro', firstLastName: 'Victoria', secondLastName: 'Rojas', sex: 'MALE', birthDate: '2001-04-04', phone: '3218840963' },
                { rol: 'KITCHEN', userName: 'blanca.ramos', email: 'blanca.ramos@hotmail.com', firstName: 'Blanca', secondName: 'Nubia', firstLastName: 'Ramos', secondLastName: 'Candelo', sex: 'FEMALE', birthDate: '1972-11-17', phone: '3134456702' },
            ],
        },
        // Medellín
        {
            name: 'El Poblado', address: 'Carrera 43A # 7-50', phone: '6047450010', city: 'Medellín', department: 'Antioquia',
            staff: [
                { rol: 'CASHIER', userName: 'susana.jaramillo', email: 'susana.jaramillo@gmail.com', firstName: 'Susana', firstLastName: 'Jaramillo', secondLastName: 'Botero', sex: 'FEMALE', birthDate: '1996-08-08', phone: '3006634519' },
                { rol: 'WAITER', userName: 'mateo.gaviria', email: 'mateo.gaviria@outlook.com', firstName: 'Mateo', firstLastName: 'Gaviria', secondLastName: 'Posada', sex: 'MALE', birthDate: '2002-05-21', phone: '3159972306' },
                { rol: 'KITCHEN', userName: 'alba.munera', email: 'alba.munera@gmail.com', firstName: 'Alba', secondName: 'Lucía', firstLastName: 'Múnera', secondLastName: 'Tobón', sex: 'FEMALE', birthDate: '1978-02-28', phone: '3114470851' },
            ],
        },
        // Barranquilla
        {
            name: 'Buenavista', address: 'Calle 98 # 52-115', phone: '6057450011', city: 'Barranquilla', department: 'Atlántico',
            staff: [
                { rol: 'CASHIER', userName: 'keila.delahoz', email: 'keila.delahoz@gmail.com', firstName: 'Keila', firstLastName: 'De la Hoz', secondLastName: 'Palacio', sex: 'FEMALE', birthDate: '1997-10-30', phone: '3016672384' },
                { rol: 'WAITER', userName: 'luis.barraza', email: 'luis.barraza@hotmail.com', firstName: 'Luis', secondName: 'Carlos', firstLastName: 'Barraza', secondLastName: 'Ahumada', sex: 'MALE', birthDate: '2000-01-16', phone: '3004419627' },
                { rol: 'KITCHEN', userName: 'edilberto.cantillo', email: 'edilberto.cantillo@gmail.com', firstName: 'Edilberto', firstLastName: 'Cantillo', secondLastName: 'Meza', sex: 'MALE', birthDate: '1975-05-09', phone: '3128865013' },
            ],
        },
        // Cartagena
        {
            name: 'Bocagrande', address: 'Avenida San Martín # 7-120', phone: '6057450012', city: 'Cartagena', department: 'Bolívar',
            staff: [
                { rol: 'CASHIER', userName: 'shirley.julio', email: 'shirley.julio@gmail.com', firstName: 'Shirley', firstLastName: 'Julio', secondLastName: 'Cassiani', sex: 'FEMALE', birthDate: '1999-07-02', phone: '3007783041' },
                { rol: 'WAITER', userName: 'andres.marrugo', email: 'andres.marrugo@outlook.com', firstName: 'Andrés', firstLastName: 'Marrugo', secondLastName: 'Pájaro', sex: 'MALE', birthDate: '2001-02-19', phone: '3046651928' },
                { rol: 'KITCHEN', userName: 'carmen.torres', email: 'carmen.torres@hotmail.com', firstName: 'Carmen', firstLastName: 'Torres', secondLastName: 'Blanco', sex: 'FEMALE', birthDate: '1977-08-26', phone: '3112208437' },
            ],
        },
        // Bucaramanga
        {
            name: 'Cabecera', address: 'Carrera 35 # 48-20', phone: '6077450013', city: 'Bucaramanga', department: 'Santander',
            staff: [
                { rol: 'CASHIER', userName: 'paola.duarte', email: 'paola.duarte@gmail.com', firstName: 'Paola', firstLastName: 'Duarte', secondLastName: 'Serrano', sex: 'FEMALE', birthDate: '1995-11-13', phone: '3176649302' },
                { rol: 'WAITER', userName: 'sergio.gomez', email: 'sergio.gomez@gmail.com', firstName: 'Sergio', firstLastName: 'Gómez', secondLastName: 'Rueda', sex: 'MALE', birthDate: '2000-06-06', phone: '3158827410' },
                { rol: 'KITCHEN', userName: 'orlando.jaimes', email: 'orlando.jaimes@outlook.com', firstName: 'Orlando', firstLastName: 'Jaimes', secondLastName: 'Plata', sex: 'MALE', birthDate: '1980-04-18', phone: '3183345691' },
            ],
        },
        // Pereira
        {
            name: 'Circunvalar', address: 'Avenida Circunvalar # 12-60', phone: '6067450014', city: 'Pereira', department: 'Risaralda',
            staff: [
                { rol: 'CASHIER', userName: 'melissa.arias', email: 'melissa.arias@gmail.com', firstName: 'Melissa', firstLastName: 'Arias', secondLastName: 'Cardona', sex: 'FEMALE', birthDate: '1998-03-10', phone: '3126650874' },
                { rol: 'WAITER', userName: 'juan.valencia', email: 'juan.valencia@hotmail.com', firstName: 'Juan', secondName: 'Pablo', firstLastName: 'Valencia', secondLastName: 'Soto', sex: 'MALE', birthDate: '2002-10-01', phone: '3207746125' },
                { rol: 'KITCHEN', userName: 'amparo.grajales', email: 'amparo.grajales@gmail.com', firstName: 'Amparo', firstLastName: 'Grajales', secondLastName: 'López', sex: 'FEMALE', birthDate: '1973-01-22', phone: '3145598230' },
            ],
        },
        // Manizales
        {
            name: 'Cable', address: 'Carrera 23 # 64-15', phone: '6067450015', city: 'Manizales', department: 'Caldas',
            staff: [
                { rol: 'CASHIER', userName: 'sara.henao', email: 'sara.henao@gmail.com', firstName: 'Sara', firstLastName: 'Henao', secondLastName: 'Castaño', sex: 'FEMALE', birthDate: '2000-09-15', phone: '3103327765' },
                { rol: 'WAITER', userName: 'samuel.giraldo', email: 'samuel.giraldo@outlook.com', firstName: 'Samuel', firstLastName: 'Giraldo', secondLastName: 'Ospina', sex: 'MALE', birthDate: '2003-03-03', phone: '3169918426' },
                { rol: 'KITCHEN', userName: 'ruben.cardona', email: 'ruben.cardona@gmail.com', firstName: 'Rubén', secondName: 'Darío', firstLastName: 'Cardona', secondLastName: 'Arango', sex: 'MALE', birthDate: '1979-12-19', phone: '3135562098' },
            ],
        },
        // Santa Marta
        {
            name: 'El Rodadero', address: 'Carrera 2 # 11-40', phone: '6057450016', city: 'Santa Marta', department: 'Magdalena',
            staff: [
                { rol: 'CASHIER', userName: 'dayana.pacheco', email: 'dayana.pacheco@hotmail.com', firstName: 'Dayana', firstLastName: 'Pacheco', secondLastName: 'Vives', sex: 'FEMALE', birthDate: '1999-05-05', phone: '3017729563' },
                { rol: 'WAITER', userName: 'jose.daza', email: 'jose.daza@gmail.com', firstName: 'José', firstLastName: 'Daza', secondLastName: 'Pinedo', sex: 'MALE', birthDate: '2001-07-28', phone: '3002286417' },
                { rol: 'KITCHEN', userName: 'eduardo.linero', email: 'eduardo.linero@gmail.com', firstName: 'Eduardo', firstLastName: 'Linero', secondLastName: 'Noguera', sex: 'MALE', birthDate: '1976-09-09', phone: '3114437820' },
            ],
        },
    ],
    inventory: [
        // Secos y panadería
        { name: 'Harina de trigo', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '25000', totalCostPerBranch: '87500', minGlobalStock: '5000' },
        { name: 'Harina integral', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '8000', totalCostPerBranch: '36000', minGlobalStock: '2000' },
        { name: 'Azúcar blanca', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '20000', totalCostPerBranch: '76000', minGlobalStock: '4000' },
        { name: 'Azúcar morena', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '6000', totalCostPerBranch: '27000' },
        { name: 'Sal refinada', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '4500' },
        { name: 'Polvo para hornear', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '24000' },
        { name: 'Esencia de vainilla', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '56000', minGlobalStock: '500' },
        { name: 'Aceite vegetal', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '10000', totalCostPerBranch: '85000' },
        { name: 'Aceite de oliva', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '105000', minGlobalStock: '1000' },
        { name: 'Crutones', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '36000' },
        { name: 'Pan pita', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '150', totalCostPerBranch: '180000', expiresInDays: 7, minGlobalStock: '50' },
        { name: 'Pan ciabatta', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '100', totalCostPerBranch: '150000', expiresInDays: 4, minGlobalStock: '40' },

        // Lácteos y huevos
        { name: 'Huevo', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '600', totalCostPerBranch: '330000', expiresInDays: 20, minGlobalStock: '200', branchMinimum: { branch: 'Parque 93', minStock: '700' } },
        { name: 'Leche entera', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '40000', totalCostPerBranch: '180000', expiresInDays: 8, minGlobalStock: '10000' },
        { name: 'Crema de leche', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '10000', totalCostPerBranch: '140000', expiresInDays: 10, minGlobalStock: '3000' },
        { name: 'Mantequilla', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '176000', expiresInDays: 30, minGlobalStock: '2000' },
        { name: 'Queso mozzarella', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '10000', totalCostPerBranch: '240000', expiresInDays: 14, minGlobalStock: '3000' },
        { name: 'Queso parmesano', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '150000', expiresInDays: 45 },
        { name: 'Queso crema', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '88000', expiresInDays: 20, minGlobalStock: '1000' },
        { name: 'Queso azul', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '1000', totalCostPerBranch: '65000', expiresInDays: 25, minGlobalStock: '1500' },
        { name: 'Queso de cabra', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '1500', totalCostPerBranch: '90000', expiresInDays: 15 },
        { name: 'Yogur griego', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '75000', expiresInDays: 12 },
        { name: 'Crema chantilly', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '6000', totalCostPerBranch: '108000', expiresInDays: 10, minGlobalStock: '2000' },

        // Proteínas
        { name: 'Pechuga de pollo', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '15000', totalCostPerBranch: '330000', expiresInDays: 4, minGlobalStock: '5000' },
        { name: 'Jamón de cerdo', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '6000', totalCostPerBranch: '132000', expiresInDays: 10, minGlobalStock: '2000' },
        { name: 'Tocineta', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '128000', expiresInDays: 12, minGlobalStock: '1500' },
        { name: 'Lomo de res', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '360000', expiresInDays: 4, minGlobalStock: '3000', branchMinimum: { branch: 'Usaquén', minStock: '5000' } },
        { name: 'Salmón ahumado', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '2000', totalCostPerBranch: '190000', expiresInDays: 8, minGlobalStock: '2500' },
        { name: 'Camarón', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '165000', expiresInDays: 3, minGlobalStock: '1000' },
        { name: 'Pavo ahumado', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '105000', expiresInDays: 10 },

        // Verduras y salsas
        { name: 'Champiñones', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '6000', totalCostPerBranch: '72000', expiresInDays: 5, minGlobalStock: '2000' },
        { name: 'Espinaca', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '27000', expiresInDays: 4, minGlobalStock: '1000' },
        { name: 'Tomate chonto', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '32000', expiresInDays: 7 },
        { name: 'Tomate cherry', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '33000', expiresInDays: 7 },
        { name: 'Cebolla morada', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '17500', expiresInDays: 15 },
        { name: 'Pimentón', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '24000', expiresInDays: 8 },
        { name: 'Maíz tierno', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '4000', totalCostPerBranch: '36000' },
        { name: 'Aguacate', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '60', totalCostPerBranch: '150000', expiresInDays: 6 },
        { name: 'Lechuga crespa', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '40', totalCostPerBranch: '60000', expiresInDays: 5, minGlobalStock: '15' },
        { name: 'Rúgula', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '1500', totalCostPerBranch: '30000', expiresInDays: 4 },
        { name: 'Albahaca fresca', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '500', totalCostPerBranch: '15000', expiresInDays: 5 },
        { name: 'Ajo', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '1000', totalCostPerBranch: '12000', expiresInDays: 30 },
        { name: 'Alcachofa en conserva', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '70000' },
        { name: 'Salsa napolitana', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '60000', expiresInDays: 7 },
        { name: 'Pesto', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '1500', totalCostPerBranch: '60000', expiresInDays: 10 },

        // Frutas
        { name: 'Fresa', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '96000', expiresInDays: 5, minGlobalStock: '3000' },
        { name: 'Banano', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '120', totalCostPerBranch: '48000', expiresInDays: 6, minGlobalStock: '40' },
        { name: 'Mora', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '40000', expiresInDays: 5 },
        { name: 'Mango', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '6000', totalCostPerBranch: '42000', expiresInDays: 7 },
        { name: 'Maracuyá', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '35000', expiresInDays: 8 },
        { name: 'Limón', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '150', totalCostPerBranch: '45000', expiresInDays: 14 },
        { name: 'Durazno en almíbar', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '4000', totalCostPerBranch: '56000' },
        { name: 'Frutos rojos congelados', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '110000', minGlobalStock: '1500' },
        { name: 'Coco rallado', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '36000' },

        // Dulces y toppings
        { name: 'Chocolate negro', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '6000', totalCostPerBranch: '210000', minGlobalStock: '2000' },
        { name: 'Chocolate blanco', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '105000' },
        { name: 'Chips de chocolate', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '60000' },
        { name: 'Arequipe', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '112000', expiresInDays: 40, minGlobalStock: '2000' },
        { name: 'Crema de avellanas', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '225000', minGlobalStock: '1500' },
        { name: 'Salsa de chocolate', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '90000' },
        { name: 'Salsa de caramelo', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '4000', totalCostPerBranch: '72000' },
        { name: 'Miel de abejas', unitOfMeasure: 'MILLILITER', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '75000' },
        { name: 'Nueces mixtas', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '135000' },
        { name: 'Almendra fileteada', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '110000' },
        { name: 'Galleta de chocolate', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '60000' },

        // Helados
        { name: 'Helado de vainilla', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '20000', totalCostPerBranch: '300000', expiresInDays: 60, minGlobalStock: '8000' },
        { name: 'Helado de chocolate', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '15000', totalCostPerBranch: '225000', expiresInDays: 60, minGlobalStock: '5000' },
        { name: 'Helado de fresa', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '10000', totalCostPerBranch: '150000', expiresInDays: 60, minGlobalStock: '12000' },
        { name: 'Helado de café', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '136000', expiresInDays: 60 },

        // Bebidas
        { name: 'Café en grano', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '210000', minGlobalStock: '1500' },
        { name: 'Té chai en polvo', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '90000' },
        { name: 'Agua con gas', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '96', totalCostPerBranch: '240000', minGlobalStock: '24' },
        { name: 'Hielo', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '30000', totalCostPerBranch: '45000' },

        // Empaques
        { name: 'Vaso desechable', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '500', totalCostPerBranch: '100000', minGlobalStock: '150' },
        { name: 'Servilleta', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '2000', totalCostPerBranch: '30000', minGlobalStock: '500' },
        { name: 'Caja para llevar', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '200', totalCostPerBranch: '120000', minGlobalStock: '250' },
    ],
    categories: [
        {
            name: 'Entradas',
            description: 'Platos para compartir antes del plato fuerte.',
            products: [
                { name: 'Champiñones gratinados', description: 'Champiñones al ajillo gratinados con mozzarella.', basePrice: '18900', profitMargin: '55', recipe: [{ item: 'Champiñones', quantity: '150' }, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Ajo', quantity: '5' }, { item: 'Mantequilla', quantity: '15' }, { item: 'Queso parmesano', quantity: '10', isOptional: true }] },
                { name: 'Bruschettas caprese', description: 'Pan ciabatta tostado con tomate cherry, albahaca y aceite de oliva.', basePrice: '16900', profitMargin: '58', recipe: [{ item: 'Pan ciabatta', quantity: '1' }, { item: 'Tomate cherry', quantity: '80' }, { item: 'Albahaca fresca', quantity: '5' }, { item: 'Aceite de oliva', quantity: '10' }, { item: 'Ajo', quantity: '3' }] },
                { name: 'Pan de ajo gratinado', description: 'Pan ciabatta con mantequilla de ajo y mozzarella.', basePrice: '13900', profitMargin: '60', recipe: [{ item: 'Pan ciabatta', quantity: '1' }, { item: 'Mantequilla', quantity: '20' }, { item: 'Ajo', quantity: '8' }, { item: 'Queso mozzarella', quantity: '50' }] },
                { name: 'Camarones apanados', description: 'Camarones apanados y fritos con limón.', basePrice: '29900', profitMargin: '45', recipe: [{ item: 'Camarón', quantity: '150' }, { item: 'Harina de trigo', quantity: '40' }, { item: 'Huevo', quantity: '1' }, { item: 'Aceite vegetal', quantity: '50' }, { item: 'Limón', quantity: '1', isOptional: true }] },
                { name: 'Guacamole con pita', description: 'Guacamole de la casa con pan pita tostado.', basePrice: '19900', profitMargin: '52', recipe: [{ item: 'Aguacate', quantity: '2' }, { item: 'Tomate chonto', quantity: '50' }, { item: 'Cebolla morada', quantity: '20' }, { item: 'Limón', quantity: '1' }, { item: 'Pan pita', quantity: '1' }] },
                { name: 'Dip de espinaca y alcachofa', description: 'Dip gratinado de espinaca, alcachofa y quesos con pita.', basePrice: '22900', profitMargin: '50', recipe: [{ item: 'Espinaca', quantity: '60' }, { item: 'Alcachofa en conserva', quantity: '60' }, { item: 'Queso crema', quantity: '60' }, { item: 'Queso parmesano', quantity: '20' }, { item: 'Pan pita', quantity: '1' }] },
                { name: 'Deditos de pollo', description: 'Tiras de pollo apanadas con salsa de miel.', basePrice: '21900', profitMargin: '50', recipe: [{ item: 'Pechuga de pollo', quantity: '150' }, { item: 'Harina de trigo', quantity: '40' }, { item: 'Huevo', quantity: '1' }, { item: 'Aceite vegetal', quantity: '60' }, { item: 'Miel de abejas', quantity: '20', isOptional: true }] },
                { name: 'Mini crepes de queso', description: 'Cuatro mini crepes rellenas de mozzarella y pesto.', basePrice: '17900', profitMargin: '55', recipe: [...CREPE_BASE, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Pesto', quantity: '15', isOptional: true }] },
                { name: 'Tabla de quesos', description: 'Queso de cabra, azul y parmesano con nueces, miel y pan.', basePrice: '34900', profitMargin: '45', recipe: [{ item: 'Queso de cabra', quantity: '40' }, { item: 'Queso azul', quantity: '30' }, { item: 'Queso parmesano', quantity: '30' }, { item: 'Nueces mixtas', quantity: '20' }, { item: 'Miel de abejas', quantity: '15' }, { item: 'Pan ciabatta', quantity: '1' }] },
            ],
        },
        {
            name: 'Crepes de sal',
            description: 'Crepes rellenas de carnes, quesos y verduras.',
            products: [
                { name: 'Crepe de pollo y champiñones', description: 'Pollo y champiñones en salsa de crema, gratinada con mozzarella.', basePrice: '32900', profitMargin: '45', recipe: [...CREPE_BASE, { item: 'Pechuga de pollo', quantity: '120' }, { item: 'Champiñones', quantity: '60' }, { item: 'Queso mozzarella', quantity: '50' }, { item: 'Crema de leche', quantity: '40' }] },
                { name: 'Crepe de jamón y queso', description: 'Jamón de cerdo y mozzarella fundida.', basePrice: '27900', profitMargin: '48', recipe: [...CREPE_BASE, { item: 'Jamón de cerdo', quantity: '80' }, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Mantequilla', quantity: '10', isOptional: true }] },
                { name: 'Crepe de lomo y champiñones', description: 'Lomo de res salteado con champiñones y crema.', basePrice: '39900', profitMargin: '42', recipe: [...CREPE_BASE, { item: 'Lomo de res', quantity: '150' }, { item: 'Champiñones', quantity: '60' }, { item: 'Crema de leche', quantity: '40' }, { item: 'Cebolla morada', quantity: '20', isOptional: true }] },
                { name: 'Crepe de espinaca y queso de cabra', description: 'Espinaca salteada con queso de cabra y nueces.', basePrice: '31900', profitMargin: '46', recipe: [...CREPE_BASE, { item: 'Espinaca', quantity: '60' }, { item: 'Queso de cabra', quantity: '50' }, { item: 'Nueces mixtas', quantity: '15', isOptional: true }] },
                { name: 'Crepe de salmón', description: 'Salmón ahumado, queso crema y rúgula.', basePrice: '42900', profitMargin: '40', recipe: [...CREPE_BASE, { item: 'Salmón ahumado', quantity: '80' }, { item: 'Queso crema', quantity: '40' }, { item: 'Rúgula', quantity: '15' }] },
                { name: 'Crepe de camarones', description: 'Camarones al ajillo con pimentón en salsa de crema.', basePrice: '41900', profitMargin: '40', recipe: [...CREPE_BASE, { item: 'Camarón', quantity: '120' }, { item: 'Ajo', quantity: '5' }, { item: 'Crema de leche', quantity: '50' }, { item: 'Pimentón', quantity: '30' }] },
                { name: 'Crepe mexicana', description: 'Pollo, maíz tierno, pimentón y aguacate con mozzarella.', basePrice: '33900', profitMargin: '45', recipe: [...CREPE_BASE, { item: 'Pechuga de pollo', quantity: '100' }, { item: 'Maíz tierno', quantity: '40' }, { item: 'Pimentón', quantity: '30' }, { item: 'Queso mozzarella', quantity: '40' }, { item: 'Aguacate', quantity: '1', isOptional: true }] },
                { name: 'Crepe de pollo y tocineta', description: 'Pollo y tocineta crocante con mozzarella.', basePrice: '34900', profitMargin: '44', recipe: [...CREPE_BASE, { item: 'Pechuga de pollo', quantity: '100' }, { item: 'Tocineta', quantity: '40' }, { item: 'Queso mozzarella', quantity: '40' }] },
                { name: 'Crepe vegetariana', description: 'Champiñones, espinaca, pimentón, maíz y tomate cherry.', basePrice: '29900', profitMargin: '50', recipe: [...CREPE_BASE, { item: 'Champiñones', quantity: '50' }, { item: 'Espinaca', quantity: '30' }, { item: 'Pimentón', quantity: '30' }, { item: 'Maíz tierno', quantity: '30' }, { item: 'Tomate cherry', quantity: '40' }, { item: 'Queso mozzarella', quantity: '40' }] },
                { name: 'Crepe de pavo y queso crema', description: 'Pavo ahumado con queso crema y rúgula.', basePrice: '31900', profitMargin: '46', recipe: [...CREPE_BASE, { item: 'Pavo ahumado', quantity: '90' }, { item: 'Queso crema', quantity: '40' }, { item: 'Rúgula', quantity: '10', isOptional: true }] },
                { name: 'Crepe cuatro quesos', description: 'Mozzarella, parmesano, queso azul y queso de cabra.', basePrice: '33900', profitMargin: '45', recipe: [...CREPE_BASE, { item: 'Queso mozzarella', quantity: '40' }, { item: 'Queso parmesano', quantity: '20' }, { item: 'Queso azul', quantity: '20' }, { item: 'Queso de cabra', quantity: '20' }] },
                { name: 'Crepe de alcachofa', description: 'Alcachofa y champiñones en crema con parmesano.', basePrice: '32900', profitMargin: '45', recipe: [...CREPE_BASE, { item: 'Alcachofa en conserva', quantity: '60' }, { item: 'Champiñones', quantity: '40' }, { item: 'Queso parmesano', quantity: '15' }, { item: 'Crema de leche', quantity: '30' }] },
            ],
        },
        {
            name: 'Crepes de dulce',
            description: 'Crepes rellenas de frutas, chocolates y helado.',
            products: [
                { name: 'Crepe de arequipe y banano', description: 'Arequipe y banano, con helado de vainilla.', basePrice: '21900', profitMargin: '55', recipe: [...CREPE_BASE, { item: 'Arequipe', quantity: '60' }, { item: 'Banano', quantity: '1' }, { item: 'Helado de vainilla', quantity: '80', isOptional: true }] },
                { name: 'Crepe de avellanas y fresa', description: 'Crema de avellanas con fresas frescas y chantilly.', basePrice: '24900', profitMargin: '52', recipe: [...CREPE_BASE, { item: 'Crema de avellanas', quantity: '50' }, { item: 'Fresa', quantity: '60' }, { item: 'Crema chantilly', quantity: '30', isOptional: true }] },
                { name: 'Crepe de frutos rojos', description: 'Frutos rojos calientes con helado de vainilla.', basePrice: '23900', profitMargin: '52', recipe: [...CREPE_BASE, { item: 'Frutos rojos congelados', quantity: '80' }, { item: 'Helado de vainilla', quantity: '80' }, { item: 'Azúcar blanca', quantity: '10' }] },
                { name: 'Crepe de chocolate y banano', description: 'Chocolate negro fundido con banano.', basePrice: '21900', profitMargin: '55', recipe: [...CREPE_BASE, { item: 'Chocolate negro', quantity: '40' }, { item: 'Banano', quantity: '1' }, { item: 'Salsa de chocolate', quantity: '30' }] },
                { name: 'Crepe de durazno con helado', description: 'Durazno en almíbar, helado de vainilla y caramelo.', basePrice: '22900', profitMargin: '54', recipe: [...CREPE_BASE, { item: 'Durazno en almíbar', quantity: '80' }, { item: 'Helado de vainilla', quantity: '80' }, { item: 'Salsa de caramelo', quantity: '20' }] },
                { name: 'Crepe de mango y maracuyá', description: 'Mango fresco con salsa de maracuyá y chantilly.', basePrice: '22900', profitMargin: '54', recipe: [...CREPE_BASE, { item: 'Mango', quantity: '80' }, { item: 'Maracuyá', quantity: '40' }, { item: 'Crema chantilly', quantity: '30' }] },
                { name: 'Crepe de coco y chocolate blanco', description: 'Chocolate blanco fundido con coco rallado.', basePrice: '23900', profitMargin: '52', recipe: [...CREPE_BASE, { item: 'Coco rallado', quantity: '25' }, { item: 'Chocolate blanco', quantity: '40' }, { item: 'Helado de vainilla', quantity: '60', isOptional: true }] },
                { name: 'Crepe suzette', description: 'Crepe con mantequilla, azúcar caramelizada y limón.', basePrice: '19900', profitMargin: '58', recipe: [...CREPE_BASE, { item: 'Limón', quantity: '1' }, { item: 'Azúcar blanca', quantity: '20' }, { item: 'Mantequilla', quantity: '20' }] },
                { name: 'Crepe de miel y nueces', description: 'Yogur griego, miel de abejas y nueces.', basePrice: '22900', profitMargin: '53', recipe: [...CREPE_BASE, { item: 'Miel de abejas', quantity: '30' }, { item: 'Nueces mixtas', quantity: '30' }, { item: 'Yogur griego', quantity: '60' }] },
                { name: 'Crepe de galleta y helado', description: 'Galleta de chocolate, helado de vainilla y salsa de chocolate.', basePrice: '22900', profitMargin: '54', recipe: [...CREPE_BASE, { item: 'Galleta de chocolate', quantity: '40' }, { item: 'Helado de vainilla', quantity: '80' }, { item: 'Salsa de chocolate', quantity: '20' }] },
            ],
        },
        {
            name: 'Waffles',
            description: 'Waffles recién hechos, dulces y de sal.',
            products: [
                { name: 'Waffle clásico con miel', description: 'Waffle con mantequilla y miel de abejas.', basePrice: '16900', profitMargin: '58', recipe: [...WAFFLE_BASE, { item: 'Miel de abejas', quantity: '30' }] },
                { name: 'Waffle de fresas con crema', description: 'Fresas frescas y crema chantilly.', basePrice: '21900', profitMargin: '55', recipe: [...WAFFLE_BASE, { item: 'Fresa', quantity: '80' }, { item: 'Crema chantilly', quantity: '40' }] },
                { name: 'Waffle de arequipe', description: 'Arequipe con helado de vainilla.', basePrice: '20900', profitMargin: '55', recipe: [...WAFFLE_BASE, { item: 'Arequipe', quantity: '50' }, { item: 'Helado de vainilla', quantity: '80', isOptional: true }] },
                { name: 'Waffle de avellanas y banano', description: 'Crema de avellanas con banano.', basePrice: '22900', profitMargin: '53', recipe: [...WAFFLE_BASE, { item: 'Crema de avellanas', quantity: '50' }, { item: 'Banano', quantity: '1' }] },
                { name: 'Waffle de frutos rojos', description: 'Frutos rojos con yogur griego.', basePrice: '22900', profitMargin: '53', recipe: [...WAFFLE_BASE, { item: 'Frutos rojos congelados', quantity: '80' }, { item: 'Yogur griego', quantity: '60' }] },
                { name: 'Waffle tres chocolates', description: 'Chocolate negro, chocolate blanco, salsa y helado de chocolate.', basePrice: '25900', profitMargin: '50', recipe: [...WAFFLE_BASE, { item: 'Chocolate negro', quantity: '30' }, { item: 'Chocolate blanco', quantity: '30' }, { item: 'Salsa de chocolate', quantity: '30' }, { item: 'Helado de chocolate', quantity: '80' }] },
                { name: 'Waffle con helado de café', description: 'Helado de café con salsa de caramelo.', basePrice: '22900', profitMargin: '53', recipe: [...WAFFLE_BASE, { item: 'Helado de café', quantity: '100' }, { item: 'Salsa de caramelo', quantity: '20' }] },
                { name: 'Waffle de pollo y tocineta', description: 'Waffle de sal con pollo, tocineta y mozzarella.', basePrice: '29900', profitMargin: '46', recipe: [...WAFFLE_BASE, { item: 'Pechuga de pollo', quantity: '100' }, { item: 'Tocineta', quantity: '30' }, { item: 'Queso mozzarella', quantity: '40' }, { item: 'Miel de abejas', quantity: '15', isOptional: true }] },
                {
                    name: 'Waffle integral con banano', description: 'Waffle de harina integral con banano, miel y nueces.', basePrice: '19900', profitMargin: '55',
                    recipe: [
                        { item: 'Harina integral', quantity: '90' },
                        { item: 'Huevo', quantity: '1' },
                        { item: 'Leche entera', quantity: '100' },
                        { item: 'Mantequilla', quantity: '20' },
                        { item: 'Polvo para hornear', quantity: '5' },
                        { item: 'Miel de abejas', quantity: '20' },
                        { item: 'Banano', quantity: '1' },
                        { item: 'Nueces mixtas', quantity: '20', isOptional: true },
                    ],
                },
            ],
        },
        {
            name: 'Ensaladas',
            description: 'Ensaladas frescas preparadas al momento.',
            products: [
                { name: 'Ensalada César con pollo', description: 'Lechuga, pollo a la plancha, parmesano y crutones.', basePrice: '29900', profitMargin: '48', recipe: [{ item: 'Lechuga crespa', quantity: '1' }, { item: 'Pechuga de pollo', quantity: '120' }, { item: 'Queso parmesano', quantity: '20' }, { item: 'Crutones', quantity: '30' }, { item: 'Tocineta', quantity: '20', isOptional: true }] },
                { name: 'Ensalada de salmón', description: 'Salmón ahumado, aguacate y tomate cherry.', basePrice: '36900', profitMargin: '42', recipe: [{ item: 'Lechuga crespa', quantity: '1' }, { item: 'Salmón ahumado', quantity: '70' }, { item: 'Aguacate', quantity: '1' }, { item: 'Tomate cherry', quantity: '50' }, { item: 'Limón', quantity: '1' }] },
                { name: 'Ensalada caprese', description: 'Tomate, mozzarella, albahaca y aceite de oliva.', basePrice: '25900', profitMargin: '50', recipe: [{ item: 'Tomate chonto', quantity: '150' }, { item: 'Queso mozzarella', quantity: '100' }, { item: 'Albahaca fresca', quantity: '10' }, { item: 'Aceite de oliva', quantity: '15' }] },
                { name: 'Ensalada de queso de cabra', description: 'Rúgula, queso de cabra, nueces, fresas y miel.', basePrice: '28900', profitMargin: '48', recipe: [{ item: 'Rúgula', quantity: '50' }, { item: 'Queso de cabra', quantity: '50' }, { item: 'Nueces mixtas', quantity: '25' }, { item: 'Fresa', quantity: '50' }, { item: 'Miel de abejas', quantity: '10' }] },
                { name: 'Ensalada de camarones', description: 'Camarones, mango y aguacate con limón.', basePrice: '35900', profitMargin: '42', recipe: [{ item: 'Lechuga crespa', quantity: '1' }, { item: 'Camarón', quantity: '120' }, { item: 'Mango', quantity: '60' }, { item: 'Limón', quantity: '1' }, { item: 'Aguacate', quantity: '1', isOptional: true }] },
                { name: 'Ensalada mediterránea', description: 'Rúgula, tomate cherry, alcachofa y parmesano.', basePrice: '27900', profitMargin: '48', recipe: [{ item: 'Rúgula', quantity: '40' }, { item: 'Tomate cherry', quantity: '60' }, { item: 'Alcachofa en conserva', quantity: '50' }, { item: 'Queso parmesano', quantity: '15' }, { item: 'Aceite de oliva', quantity: '15' }, { item: 'Cebolla morada', quantity: '20' }] },
                { name: 'Ensalada de pollo y aguacate', description: 'Pollo, aguacate, maíz tierno y tomate.', basePrice: '28900', profitMargin: '47', recipe: [{ item: 'Lechuga crespa', quantity: '1' }, { item: 'Pechuga de pollo', quantity: '100' }, { item: 'Aguacate', quantity: '1' }, { item: 'Maíz tierno', quantity: '40' }, { item: 'Tomate chonto', quantity: '60' }] },
            ],
        },
        {
            name: 'Pitas y paninis',
            description: 'Pan pita y ciabatta rellenos.',
            products: [
                { name: 'Pita de pollo', description: 'Pollo, tomate y cebolla morada con salsa de yogur.', basePrice: '26900', profitMargin: '48', recipe: [{ item: 'Pan pita', quantity: '1' }, { item: 'Pechuga de pollo', quantity: '110' }, { item: 'Tomate chonto', quantity: '40' }, { item: 'Yogur griego', quantity: '30' }, { item: 'Cebolla morada', quantity: '15' }] },
                { name: 'Pita de lomo', description: 'Lomo de res con pimentón y cebolla.', basePrice: '31900', profitMargin: '45', recipe: [{ item: 'Pan pita', quantity: '1' }, { item: 'Lomo de res', quantity: '120' }, { item: 'Pimentón', quantity: '30' }, { item: 'Cebolla morada', quantity: '20' }, { item: 'Queso crema', quantity: '20', isOptional: true }] },
                { name: 'Pita vegetariana', description: 'Champiñones, espinaca, pimentón y queso de cabra.', basePrice: '24900', profitMargin: '50', recipe: [{ item: 'Pan pita', quantity: '1' }, { item: 'Champiñones', quantity: '50' }, { item: 'Espinaca', quantity: '30' }, { item: 'Pimentón', quantity: '30' }, { item: 'Queso de cabra', quantity: '30' }] },
                { name: 'Panini caprese', description: 'Mozzarella, tomate, albahaca y pesto.', basePrice: '25900', profitMargin: '50', recipe: [{ item: 'Pan ciabatta', quantity: '1' }, { item: 'Queso mozzarella', quantity: '70' }, { item: 'Tomate chonto', quantity: '60' }, { item: 'Albahaca fresca', quantity: '5' }, { item: 'Pesto', quantity: '20' }] },
                { name: 'Panini de pavo', description: 'Pavo ahumado, queso crema y rúgula.', basePrice: '27900', profitMargin: '48', recipe: [{ item: 'Pan ciabatta', quantity: '1' }, { item: 'Pavo ahumado', quantity: '90' }, { item: 'Queso crema', quantity: '30' }, { item: 'Rúgula', quantity: '15' }] },
                { name: 'Panini de jamón y queso', description: 'Jamón de cerdo y mozzarella fundida.', basePrice: '23900', profitMargin: '50', recipe: [{ item: 'Pan ciabatta', quantity: '1' }, { item: 'Jamón de cerdo', quantity: '80' }, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Mantequilla', quantity: '10' }] },
            ],
        },
        {
            name: 'Pizzetas',
            description: 'Pizzas individuales de masa delgada.',
            products: [
                { name: 'Pizzeta margarita', description: 'Salsa napolitana, mozzarella y albahaca.', basePrice: '24900', profitMargin: '52', recipe: [...PIZZETA_BASE, { item: 'Salsa napolitana', quantity: '60' }, { item: 'Queso mozzarella', quantity: '80' }, { item: 'Albahaca fresca', quantity: '5' }] },
                { name: 'Pizzeta de pollo y champiñones', description: 'Pollo, champiñones y mozzarella.', basePrice: '28900', profitMargin: '48', recipe: [...PIZZETA_BASE, { item: 'Salsa napolitana', quantity: '60' }, { item: 'Queso mozzarella', quantity: '70' }, { item: 'Pechuga de pollo', quantity: '80' }, { item: 'Champiñones', quantity: '50' }] },
                { name: 'Pizzeta de pesto y tomate cherry', description: 'Pesto, mozzarella y tomate cherry.', basePrice: '26900', profitMargin: '50', recipe: [...PIZZETA_BASE, { item: 'Pesto', quantity: '30' }, { item: 'Queso mozzarella', quantity: '70' }, { item: 'Tomate cherry', quantity: '60' }] },
                { name: 'Pizzeta cuatro quesos', description: 'Mozzarella, parmesano, queso azul y queso de cabra.', basePrice: '29900', profitMargin: '48', recipe: [...PIZZETA_BASE, { item: 'Salsa napolitana', quantity: '50' }, { item: 'Queso mozzarella', quantity: '50' }, { item: 'Queso parmesano', quantity: '20' }, { item: 'Queso azul', quantity: '20' }, { item: 'Queso de cabra', quantity: '20' }] },
                { name: 'Pizzeta de salmón y rúgula', description: 'Queso crema, salmón ahumado y rúgula.', basePrice: '34900', profitMargin: '44', recipe: [...PIZZETA_BASE, { item: 'Queso crema', quantity: '40' }, { item: 'Salmón ahumado', quantity: '60' }, { item: 'Rúgula', quantity: '20' }] },
            ],
        },
        {
            name: 'Helados y postres',
            description: 'Copas de helado y postres de la casa.',
            products: [
                { name: 'Copa de vainilla', description: 'Tres bolas de helado de vainilla.', basePrice: '12900', profitMargin: '60', recipe: [{ item: 'Helado de vainilla', quantity: '150' }, { item: 'Salsa de chocolate', quantity: '20', isOptional: true }] },
                { name: 'Copa tres sabores', description: 'Vainilla, chocolate y fresa con chantilly.', basePrice: '15900', profitMargin: '58', recipe: [{ item: 'Helado de vainilla', quantity: '80' }, { item: 'Helado de chocolate', quantity: '80' }, { item: 'Helado de fresa', quantity: '80' }, { item: 'Crema chantilly', quantity: '30' }] },
                { name: 'Banana split', description: 'Banano con tres helados, salsa de chocolate y chantilly.', basePrice: '18900', profitMargin: '55', recipe: [{ item: 'Banano', quantity: '1' }, { item: 'Helado de vainilla', quantity: '70' }, { item: 'Helado de chocolate', quantity: '70' }, { item: 'Helado de fresa', quantity: '70' }, { item: 'Salsa de chocolate', quantity: '20' }, { item: 'Crema chantilly', quantity: '30' }, { item: 'Almendra fileteada', quantity: '10', isOptional: true }] },
                { name: 'Brownie con helado', description: 'Brownie de chocolate caliente con helado de vainilla.', basePrice: '16900', profitMargin: '56', recipe: [{ item: 'Chocolate negro', quantity: '60' }, { item: 'Harina de trigo', quantity: '30' }, { item: 'Huevo', quantity: '1' }, { item: 'Azúcar blanca', quantity: '40' }, { item: 'Mantequilla', quantity: '30' }, { item: 'Helado de vainilla', quantity: '80' }] },
                { name: 'Copa de frutos rojos', description: 'Helado de fresa con frutos rojos y chantilly.', basePrice: '15900', profitMargin: '57', recipe: [{ item: 'Helado de fresa', quantity: '120' }, { item: 'Frutos rojos congelados', quantity: '60' }, { item: 'Crema chantilly', quantity: '30' }] },
                { name: 'Sundae de caramelo', description: 'Helado de café con caramelo y almendras.', basePrice: '14900', profitMargin: '58', recipe: [{ item: 'Helado de café', quantity: '120' }, { item: 'Salsa de caramelo', quantity: '30' }, { item: 'Almendra fileteada', quantity: '10' }, { item: 'Crema chantilly', quantity: '20' }] },
                { name: 'Copa de galleta', description: 'Helado de vainilla con galleta de chocolate.', basePrice: '14900', profitMargin: '58', recipe: [{ item: 'Helado de vainilla', quantity: '120' }, { item: 'Galleta de chocolate', quantity: '40' }, { item: 'Salsa de chocolate', quantity: '20' }] },
                { name: 'Cheesecake de frutos rojos', description: 'Cheesecake horneado con base de galleta.', basePrice: '15900', profitMargin: '57', recipe: [{ item: 'Queso crema', quantity: '100' }, { item: 'Galleta de chocolate', quantity: '40' }, { item: 'Mantequilla', quantity: '20' }, { item: 'Azúcar blanca', quantity: '30' }, { item: 'Huevo', quantity: '1' }, { item: 'Frutos rojos congelados', quantity: '40' }] },
                { name: 'Merengón de fresa', description: 'Merengue con fresas y crema chantilly.', basePrice: '14900', profitMargin: '58', recipe: [{ item: 'Huevo', quantity: '2' }, { item: 'Azúcar blanca', quantity: '60' }, { item: 'Fresa', quantity: '80' }, { item: 'Crema chantilly', quantity: '50' }] },
                { name: 'Postre de maracuyá', description: 'Mousse de maracuyá sobre galleta.', basePrice: '12900', profitMargin: '60', recipe: [{ item: 'Queso crema', quantity: '60' }, { item: 'Crema de leche', quantity: '60' }, { item: 'Maracuyá', quantity: '50' }, { item: 'Azúcar blanca', quantity: '30' }, { item: 'Galleta de chocolate', quantity: '20' }] },
            ],
        },
        {
            name: 'Malteadas',
            description: 'Malteadas cremosas de helado.',
            products: [
                { name: 'Malteada de vainilla', description: 'Helado de vainilla batido con leche.', basePrice: '13900', profitMargin: '58', recipe: [{ item: 'Helado de vainilla', quantity: '200' }, { item: 'Leche entera', quantity: '150' }, { item: 'Crema chantilly', quantity: '30', isOptional: true }] },
                { name: 'Malteada de chocolate', description: 'Helado de chocolate con salsa de chocolate.', basePrice: '13900', profitMargin: '58', recipe: [{ item: 'Helado de chocolate', quantity: '200' }, { item: 'Leche entera', quantity: '150' }, { item: 'Salsa de chocolate', quantity: '30' }] },
                { name: 'Malteada de fresa', description: 'Helado de fresa con fresas frescas.', basePrice: '13900', profitMargin: '58', recipe: [{ item: 'Helado de fresa', quantity: '200' }, { item: 'Leche entera', quantity: '150' }, { item: 'Fresa', quantity: '50' }] },
                { name: 'Malteada de arequipe', description: 'Helado de vainilla con arequipe.', basePrice: '14900', profitMargin: '57', recipe: [{ item: 'Helado de vainilla', quantity: '180' }, { item: 'Leche entera', quantity: '150' }, { item: 'Arequipe', quantity: '40' }] },
                { name: 'Malteada de galleta', description: 'Helado de vainilla con galleta de chocolate.', basePrice: '14900', profitMargin: '57', recipe: [{ item: 'Helado de vainilla', quantity: '180' }, { item: 'Leche entera', quantity: '150' }, { item: 'Galleta de chocolate', quantity: '40' }] },
                { name: 'Malteada de café', description: 'Helado de café con un shot de espresso.', basePrice: '14900', profitMargin: '57', recipe: [{ item: 'Helado de café', quantity: '180' }, { item: 'Leche entera', quantity: '150' }, { item: 'Café en grano', quantity: '10' }] },
            ],
        },
        {
            name: 'Bebidas calientes',
            description: 'Cafés, chocolates y tés.',
            products: [
                { name: 'Espresso', description: 'Shot doble de espresso.', basePrice: '4900', profitMargin: '70', recipe: [{ item: 'Café en grano', quantity: '18' }] },
                { name: 'Americano', description: 'Espresso alargado con agua caliente.', basePrice: '5500', profitMargin: '70', recipe: [{ item: 'Café en grano', quantity: '18' }] },
                { name: 'Capuchino', description: 'Espresso con leche vaporizada y espuma.', basePrice: '7900', profitMargin: '65', recipe: [{ item: 'Café en grano', quantity: '18' }, { item: 'Leche entera', quantity: '180' }, { item: 'Azúcar blanca', quantity: '10', isOptional: true }] },
                { name: 'Latte de vainilla', description: 'Espresso con leche y esencia de vainilla.', basePrice: '8900', profitMargin: '63', recipe: [{ item: 'Café en grano', quantity: '18' }, { item: 'Leche entera', quantity: '220' }, { item: 'Esencia de vainilla', quantity: '5' }] },
                { name: 'Mocaccino', description: 'Espresso con leche y salsa de chocolate.', basePrice: '9500', profitMargin: '62', recipe: [{ item: 'Café en grano', quantity: '18' }, { item: 'Leche entera', quantity: '180' }, { item: 'Salsa de chocolate', quantity: '20' }, { item: 'Crema chantilly', quantity: '20', isOptional: true }] },
                { name: 'Chocolate caliente', description: 'Chocolate negro fundido en leche.', basePrice: '8900', profitMargin: '60', recipe: [{ item: 'Chocolate negro', quantity: '40' }, { item: 'Leche entera', quantity: '250' }, { item: 'Crema chantilly', quantity: '20', isOptional: true }] },
                { name: 'Chai latte', description: 'Té chai especiado con leche.', basePrice: '9500', profitMargin: '62', recipe: [{ item: 'Té chai en polvo', quantity: '25' }, { item: 'Leche entera', quantity: '220' }, { item: 'Miel de abejas', quantity: '10', isOptional: true }] },
            ],
        },
        {
            name: 'Bebidas frías',
            description: 'Jugos, limonadas y bebidas con hielo.',
            products: [
                { name: 'Limonada natural', description: 'Limonada de limón fresco.', basePrice: '7500', profitMargin: '68', recipe: [{ item: 'Limón', quantity: '3' }, { item: 'Azúcar blanca', quantity: '30' }, { item: 'Hielo', quantity: '150' }] },
                { name: 'Limonada de coco', description: 'Limonada frapé con coco.', basePrice: '10900', profitMargin: '62', recipe: [{ item: 'Limón', quantity: '2' }, { item: 'Coco rallado', quantity: '30' }, { item: 'Leche entera', quantity: '60' }, { item: 'Azúcar blanca', quantity: '25' }, { item: 'Hielo', quantity: '150' }] },
                { name: 'Jugo de mora', description: 'Jugo natural de mora en agua.', basePrice: '7900', profitMargin: '65', recipe: [{ item: 'Mora', quantity: '150' }, { item: 'Hielo', quantity: '100' }, { item: 'Azúcar blanca', quantity: '20', isOptional: true }] },
                { name: 'Jugo de mango', description: 'Jugo natural de mango en agua.', basePrice: '7900', profitMargin: '65', recipe: [{ item: 'Mango', quantity: '150' }, { item: 'Hielo', quantity: '100' }, { item: 'Azúcar blanca', quantity: '20', isOptional: true }] },
                { name: 'Jugo de maracuyá', description: 'Jugo natural de maracuyá en agua.', basePrice: '7900', profitMargin: '65', recipe: [{ item: 'Maracuyá', quantity: '120' }, { item: 'Azúcar blanca', quantity: '30' }, { item: 'Hielo', quantity: '100' }] },
                { name: 'Smoothie de frutos rojos', description: 'Frutos rojos con yogur griego y miel.', basePrice: '12900', profitMargin: '58', recipe: [{ item: 'Frutos rojos congelados', quantity: '120' }, { item: 'Yogur griego', quantity: '100' }, { item: 'Miel de abejas', quantity: '15' }, { item: 'Hielo', quantity: '80' }] },
                { name: 'Café helado', description: 'Espresso con leche fría y hielo.', basePrice: '8900', profitMargin: '63', recipe: [{ item: 'Café en grano', quantity: '18' }, { item: 'Leche entera', quantity: '150' }, { item: 'Hielo', quantity: '150' }, { item: 'Azúcar blanca', quantity: '15', isOptional: true }] },
                { name: 'Agua con gas', description: 'Botella de agua con gas.', basePrice: '5500', profitMargin: '55', recipe: [{ item: 'Agua con gas', quantity: '1' }, { item: 'Limón', quantity: '1', isOptional: true }] },
            ],
        },
        {
            name: 'Para llevar',
            description: 'Productos empacados para llevar.',
            products: [
                { name: 'Crepe de pollo para llevar', description: 'Crepe de pollo y champiñones en caja.', basePrice: '34900', profitMargin: '44', recipe: [...CREPE_BASE, { item: 'Pechuga de pollo', quantity: '120' }, { item: 'Champiñones', quantity: '60' }, { item: 'Queso mozzarella', quantity: '50' }, { item: 'Caja para llevar', quantity: '1' }, { item: 'Servilleta', quantity: '2' }] },
                { name: 'Waffle de arequipe para llevar', description: 'Waffle de arequipe en caja.', basePrice: '22900', profitMargin: '52', recipe: [...WAFFLE_BASE, { item: 'Arequipe', quantity: '50' }, { item: 'Caja para llevar', quantity: '1' }, { item: 'Servilleta', quantity: '2' }] },
                { name: 'Limonada para llevar', description: 'Limonada natural en vaso desechable.', basePrice: '8000', profitMargin: '65', recipe: [{ item: 'Limón', quantity: '3' }, { item: 'Azúcar blanca', quantity: '30' }, { item: 'Hielo', quantity: '150' }, { item: 'Vaso desechable', quantity: '1' }] },
                { name: 'Malteada para llevar', description: 'Malteada de vainilla en vaso desechable.', basePrice: '14500', profitMargin: '56', recipe: [{ item: 'Helado de vainilla', quantity: '200' }, { item: 'Leche entera', quantity: '150' }, { item: 'Vaso desechable', quantity: '1' }] },
            ],
        },
    ],
};

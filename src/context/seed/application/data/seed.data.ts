/**
 * Datos de prueba que siembra `POST /seed`.
 *
 * Aquí solo hay datos, nada de lógica. Para cambiar un nombre, agregar un insumo
 * o un producto basta con editar este archivo. Las referencias entre datos van
 * por nombre (la sucursal de un usuario, el insumo de una receta) porque los ids
 * se generan al crear cada cosa.
 */


/** Contraseña de todos los usuarios sembrados. Cumple las reglas de `UserPlainPassword`. */
export const SEED_PASSWORD = 'Komi12345678';


export type SeedRolCode = 'OWNER' | 'ADMIN' | 'SUPERVISOR' | 'CASHIER' | 'WAITER' | 'KITCHEN';


export interface SeedUser {
    rol: SeedRolCode;
    userName: string;
    firstName: string;
    firstLastName: string;
    sex: 'MALE' | 'FEMALE';
    birthDate: string;
    phone: string;
}


export interface SeedBranch {
    name: string;
    address: string;
    phone: string;
    city: string;
    department: string;

    /** Personal operativo de la sede: cajero, mesero y cocina. */
    staff: SeedUser[];
}


export interface SeedInventoryItem {
    name: string;
    unitOfMeasure: 'GRAM' | 'MILLILITER' | 'UNIT';
    isPerishable: boolean;

    /** Cantidad que recibe cada sucursal en su lote inicial. */
    quantityPerBranch: string;

    /** Lo que costó ese lote completo, en COP. El costo unitario sale de dividirlo. */
    totalCostPerBranch: string;

    /** Días hasta el vencimiento. Solo se usa en los perecederos. */
    expiresInDays?: number;

    minGlobalStock?: string;

    /** Mínimo propio de una sucursal, que reemplaza al global en esa sede. */
    branchMinimum?: { branch: string; minStock: string };
}


export interface SeedRecipeIngredient {
    item: string;
    quantity: string;
    isOptional?: boolean;
}


export interface SeedProduct {
    name: string;
    description: string;
    basePrice: string;
    profitMargin: string;
    recipe: SeedRecipeIngredient[];
}


export interface SeedCategory {
    name: string;
    description: string;
    products: SeedProduct[];
}


export interface SeedTenant {
    name: string;
    description: string;
    slug: string;
    nit: string;

    /** Dueño, administrador y supervisor. Son administrativos, así que no llevan sucursal. */
    administrators: SeedUser[];

    branches: SeedBranch[];
    inventory: SeedInventoryItem[];
    categories: SeedCategory[];
}


/**
 * Arma el personal operativo de una sede. El nombre de usuario lleva el sufijo
 * de la sede para que no se repita entre sucursales del mismo negocio.
 */
const staffFor = (
    suffix: string,
    phonePrefix: string,
    cashier: [string, string, 'MALE' | 'FEMALE'],
    waiter: [string, string, 'MALE' | 'FEMALE'],
    kitchen: [string, string, 'MALE' | 'FEMALE'],
): SeedUser[] => [
    { rol: 'CASHIER', userName: `cajero.${suffix}`, firstName: cashier[0], firstLastName: cashier[1], sex: cashier[2], birthDate: '1995-03-14', phone: `${phonePrefix}01` },
    { rol: 'WAITER', userName: `mesero.${suffix}`, firstName: waiter[0], firstLastName: waiter[1], sex: waiter[2], birthDate: '1998-07-22', phone: `${phonePrefix}02` },
    { rol: 'KITCHEN', userName: `cocina.${suffix}`, firstName: kitchen[0], firstLastName: kitchen[1], sex: kitchen[2], birthDate: '1990-11-05', phone: `${phonePrefix}03` },
];


export const SEED_TENANTS: SeedTenant[] = [
    {
        name: 'Sabor Criollo',
        description: 'Restaurante de comida típica colombiana con tres sedes en Medellín.',
        slug: 'sabor-criollo',
        nit: '900555101-1',
        administrators: [
            { rol: 'OWNER', userName: 'dueno', firstName: 'Carlos', firstLastName: 'Restrepo', sex: 'MALE', birthDate: '1975-02-10', phone: '3001000001' },
            { rol: 'ADMIN', userName: 'admin', firstName: 'Diana', firstLastName: 'Cardona', sex: 'FEMALE', birthDate: '1985-06-18', phone: '3001000002' },
            { rol: 'SUPERVISOR', userName: 'supervisor', firstName: 'Jorge', firstLastName: 'Mejía', sex: 'MALE', birthDate: '1988-09-30', phone: '3001000003' },
        ],
        branches: [
            {
                name: 'Centro', address: 'Carrera 50 # 52-20', phone: '6045110001', city: 'Medellín', department: 'Antioquia',
                staff: staffFor('centro', '30011001', ['Laura', 'Gómez', 'FEMALE'], ['Andrés', 'Ruiz', 'MALE'], ['Marta', 'Díaz', 'FEMALE']),
            },
            {
                name: 'Laureles', address: 'Circular 1 # 70-15', phone: '6045110002', city: 'Medellín', department: 'Antioquia',
                staff: staffFor('laureles', '30011002', ['Sofía', 'Arango', 'FEMALE'], ['Felipe', 'Osorio', 'MALE'], ['Luis', 'Zapata', 'MALE']),
            },
            {
                name: 'Envigado', address: 'Calle 38 Sur # 43-10', phone: '6045110003', city: 'Envigado', department: 'Antioquia',
                staff: staffFor('envigado', '30011003', ['Paula', 'Vélez', 'FEMALE'], ['Camilo', 'Henao', 'MALE'], ['Rosa', 'Castaño', 'FEMALE']),
            },
        ],
        inventory: [
            { name: 'Arroz blanco', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '25000', totalCostPerBranch: '95000', minGlobalStock: '5000' },
            { name: 'Fríjol cargamanto', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '10000', totalCostPerBranch: '120000', minGlobalStock: '3000' },
            { name: 'Carne molida de res', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '8000', totalCostPerBranch: '176000', expiresInDays: 5, minGlobalStock: '4000', branchMinimum: { branch: 'Centro', minStock: '9000' } },
            { name: 'Chicharrón', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '6000', totalCostPerBranch: '150000', expiresInDays: 4, minGlobalStock: '2000' },
            { name: 'Huevo', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '180', totalCostPerBranch: '99000', expiresInDays: 20, minGlobalStock: '60' },
            { name: 'Plátano maduro', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '40', totalCostPerBranch: '48000', expiresInDays: 7, minGlobalStock: '50' },
            { name: 'Aguacate', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '30', totalCostPerBranch: '75000', expiresInDays: 6 },
            { name: 'Leche entera', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '12000', totalCostPerBranch: '54000', expiresInDays: 10, minGlobalStock: '3000' },
            { name: 'Panela', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '30000' },
        ],
        categories: [
            {
                name: 'Platos fuertes',
                description: 'Platos típicos servidos al almuerzo y la cena.',
                products: [
                    {
                        name: 'Bandeja paisa', description: 'Fríjoles, arroz, carne molida, chicharrón, huevo, plátano y aguacate.', basePrice: '32000', profitMargin: '45',
                        recipe: [
                            { item: 'Arroz blanco', quantity: '200' },
                            { item: 'Fríjol cargamanto', quantity: '150' },
                            { item: 'Carne molida de res', quantity: '120' },
                            { item: 'Chicharrón', quantity: '100' },
                            { item: 'Huevo', quantity: '1' },
                            { item: 'Plátano maduro', quantity: '1' },
                            { item: 'Aguacate', quantity: '1', isOptional: true },
                        ],
                    },
                    {
                        name: 'Calentado', description: 'Arroz y fríjoles del día con huevo frito.', basePrice: '16000', profitMargin: '40',
                        recipe: [
                            { item: 'Arroz blanco', quantity: '150' },
                            { item: 'Fríjol cargamanto', quantity: '120' },
                            { item: 'Huevo', quantity: '2' },
                        ],
                    },
                ],
            },
            {
                name: 'Acompañamientos',
                description: 'Porciones adicionales para cualquier plato.',
                products: [
                    { name: 'Porción de maduro', description: 'Plátano maduro frito.', basePrice: '5000', profitMargin: '50', recipe: [{ item: 'Plátano maduro', quantity: '1' }] },
                    { name: 'Porción de aguacate', description: 'Medio aguacate en tajadas.', basePrice: '6000', profitMargin: '50', recipe: [{ item: 'Aguacate', quantity: '1' }] },
                ],
            },
            {
                name: 'Bebidas',
                description: 'Bebidas preparadas en la casa.',
                products: [
                    { name: 'Aguapanela con leche', description: 'Aguapanela caliente con leche entera.', basePrice: '4500', profitMargin: '60', recipe: [{ item: 'Panela', quantity: '60' }, { item: 'Leche entera', quantity: '150' }] },
                ],
            },
        ],
    },

    {
        name: 'La Parrilla del Puerto',
        description: 'Asadero de carnes y mariscos con dos sedes en Barranquilla.',
        slug: 'la-parrilla-del-puerto',
        nit: '900555102-2',
        administrators: [
            { rol: 'OWNER', userName: 'dueno', firstName: 'Ricardo', firstLastName: 'Barrios', sex: 'MALE', birthDate: '1970-04-03', phone: '3002000001' },
            { rol: 'ADMIN', userName: 'admin', firstName: 'Natalia', firstLastName: 'Pertuz', sex: 'FEMALE', birthDate: '1987-12-01', phone: '3002000002' },
            { rol: 'SUPERVISOR', userName: 'supervisor', firstName: 'Hernán', firstLastName: 'Charris', sex: 'MALE', birthDate: '1983-08-25', phone: '3002000003' },
        ],
        branches: [
            {
                name: 'Alto Prado', address: 'Carrera 53 # 79-45', phone: '6053600001', city: 'Barranquilla', department: 'Atlántico',
                staff: staffFor('altoprado', '30021001', ['Yuli', 'Mendoza', 'FEMALE'], ['Kevin', 'Orozco', 'MALE'], ['Wilson', 'Polo', 'MALE']),
            },
            {
                name: 'Malecón', address: 'Vía 40 # 36-120', phone: '6053600002', city: 'Barranquilla', department: 'Atlántico',
                staff: staffFor('malecon', '30021002', ['Karen', 'Ospino', 'FEMALE'], ['Jesús', 'Maestre', 'MALE'], ['Ana', 'Fontalvo', 'FEMALE']),
            },
        ],
        inventory: [
            { name: 'Punta de anca', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '15000', totalCostPerBranch: '480000', expiresInDays: 6, minGlobalStock: '5000' },
            { name: 'Costilla de cerdo', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '10000', totalCostPerBranch: '260000', expiresInDays: 6, minGlobalStock: '12000' },
            { name: 'Camarón', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '220000', expiresInDays: 3, minGlobalStock: '1500', branchMinimum: { branch: 'Malecón', minStock: '3000' } },
            { name: 'Papa criolla', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '12000', totalCostPerBranch: '60000', expiresInDays: 12 },
            { name: 'Yuca', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '10000', totalCostPerBranch: '35000', expiresInDays: 10, minGlobalStock: '2000' },
            { name: 'Sal marina', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '3000', totalCostPerBranch: '9000' },
            { name: 'Limón', unitOfMeasure: 'UNIT', isPerishable: true, quantityPerBranch: '150', totalCostPerBranch: '45000', expiresInDays: 14 },
            { name: 'Cerveza nacional', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '96', totalCostPerBranch: '336000', minGlobalStock: '48' },
        ],
        categories: [
            {
                name: 'Carnes a la parrilla',
                description: 'Cortes asados al carbón.',
                products: [
                    { name: 'Punta de anca 400 g', description: 'Con papa criolla y yuca frita.', basePrice: '48000', profitMargin: '40', recipe: [{ item: 'Punta de anca', quantity: '400' }, { item: 'Papa criolla', quantity: '150' }, { item: 'Yuca', quantity: '150' }, { item: 'Sal marina', quantity: '5' }] },
                    { name: 'Costillas BBQ', description: 'Costilla de cerdo glaseada con papa criolla.', basePrice: '42000', profitMargin: '42', recipe: [{ item: 'Costilla de cerdo', quantity: '500' }, { item: 'Papa criolla', quantity: '150' }] },
                ],
            },
            {
                name: 'Mariscos',
                description: 'Preparaciones del mar.',
                products: [
                    { name: 'Camarones al ajillo', description: 'Camarones salteados con limón y yuca.', basePrice: '45000', profitMargin: '45', recipe: [{ item: 'Camarón', quantity: '250' }, { item: 'Limón', quantity: '1' }, { item: 'Yuca', quantity: '150', isOptional: true }] },
                ],
            },
            {
                name: 'Bebidas',
                description: 'Bebidas frías.',
                products: [
                    { name: 'Cerveza', description: 'Cerveza nacional en botella.', basePrice: '6000', profitMargin: '70', recipe: [{ item: 'Cerveza nacional', quantity: '1' }] },
                    { name: 'Michelada', description: 'Cerveza con limón y sal.', basePrice: '9000', profitMargin: '65', recipe: [{ item: 'Cerveza nacional', quantity: '1' }, { item: 'Limón', quantity: '2' }, { item: 'Sal marina', quantity: '10' }] },
                ],
            },
        ],
    },

    {
        name: 'Café Montaña',
        description: 'Cafetería de especialidad con dos sedes en Manizales.',
        slug: 'cafe-montana',
        nit: '900555103-3',
        administrators: [
            { rol: 'OWNER', userName: 'dueno', firstName: 'Valentina', firstLastName: 'Giraldo', sex: 'FEMALE', birthDate: '1982-01-27', phone: '3003000001' },
            { rol: 'ADMIN', userName: 'admin', firstName: 'Mateo', firstLastName: 'Salazar', sex: 'MALE', birthDate: '1990-05-09', phone: '3003000002' },
            { rol: 'SUPERVISOR', userName: 'supervisor', firstName: 'Lorena', firstLastName: 'Ocampo', sex: 'FEMALE', birthDate: '1992-10-14', phone: '3003000003' },
        ],
        branches: [
            {
                name: 'Cable', address: 'Carrera 23 # 65-10', phone: '6068800001', city: 'Manizales', department: 'Caldas',
                staff: staffFor('cable', '30031001', ['Daniela', 'Marín', 'FEMALE'], ['Santiago', 'Toro', 'MALE'], ['Óscar', 'Ramírez', 'MALE']),
            },
            {
                name: 'Chipre', address: 'Avenida 12 de Octubre # 3-40', phone: '6068800002', city: 'Manizales', department: 'Caldas',
                staff: staffFor('chipre', '30031002', ['Juliana', 'Loaiza', 'FEMALE'], ['Tomás', 'Echeverri', 'MALE'], ['Gloria', 'Aristizábal', 'FEMALE']),
            },
        ],
        inventory: [
            { name: 'Café en grano', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '210000', minGlobalStock: '2000' },
            { name: 'Leche entera', unitOfMeasure: 'MILLILITER', isPerishable: true, quantityPerBranch: '20000', totalCostPerBranch: '90000', expiresInDays: 8, minGlobalStock: '25000' },
            { name: 'Azúcar', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '6000', totalCostPerBranch: '24000' },
            { name: 'Harina de trigo', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '8000', totalCostPerBranch: '28000', minGlobalStock: '2000' },
            { name: 'Mantequilla', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '3000', totalCostPerBranch: '66000', expiresInDays: 30, branchMinimum: { branch: 'Cable', minStock: '1000' } },
            { name: 'Queso campesino', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '72000', expiresInDays: 9 },
            { name: 'Chocolate de mesa', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '2500', totalCostPerBranch: '37500' },
        ],
        categories: [
            {
                name: 'Cafés',
                description: 'Bebidas a base de espresso.',
                products: [
                    { name: 'Espresso', description: 'Shot doble de café de origen.', basePrice: '4000', profitMargin: '70', recipe: [{ item: 'Café en grano', quantity: '18' }] },
                    { name: 'Capuchino', description: 'Espresso con leche vaporizada.', basePrice: '7000', profitMargin: '65', recipe: [{ item: 'Café en grano', quantity: '18' }, { item: 'Leche entera', quantity: '180' }, { item: 'Azúcar', quantity: '10', isOptional: true }] },
                ],
            },
            {
                name: 'Panadería',
                description: 'Horneados del día.',
                products: [
                    { name: 'Pandebono', description: 'Pandebono recién horneado.', basePrice: '3000', profitMargin: '55', recipe: [{ item: 'Harina de trigo', quantity: '40' }, { item: 'Queso campesino', quantity: '30' }] },
                    { name: 'Croissant de mantequilla', description: 'Hojaldre de mantequilla.', basePrice: '6500', profitMargin: '50', recipe: [{ item: 'Harina de trigo', quantity: '60' }, { item: 'Mantequilla', quantity: '30' }] },
                ],
            },
            {
                name: 'Bebidas calientes',
                description: 'Bebidas tradicionales sin café.',
                products: [
                    { name: 'Chocolate con queso', description: 'Chocolate de mesa en leche con queso campesino.', basePrice: '8000', profitMargin: '55', recipe: [{ item: 'Chocolate de mesa', quantity: '40' }, { item: 'Leche entera', quantity: '250' }, { item: 'Queso campesino', quantity: '50' }] },
                ],
            },
        ],
    },

    {
        // Negocio con una sola sede: sirve para probar pantallas y reglas sin
        // selector de sucursal.
        name: 'Arepas Doña Rosa',
        description: 'Puesto de arepas y jugos naturales con una sola sede en Bogotá.',
        slug: 'arepas-dona-rosa',
        nit: '900555104-4',
        administrators: [
            { rol: 'OWNER', userName: 'dueno', firstName: 'Rosa', firstLastName: 'Pardo', sex: 'FEMALE', birthDate: '1968-03-08', phone: '3004000001' },
            { rol: 'ADMIN', userName: 'admin', firstName: 'Miguel', firstLastName: 'Pardo', sex: 'MALE', birthDate: '1994-07-19', phone: '3004000002' },
            { rol: 'SUPERVISOR', userName: 'supervisor', firstName: 'Clara', firstLastName: 'Rincón', sex: 'FEMALE', birthDate: '1989-02-11', phone: '3004000003' },
        ],
        branches: [
            {
                name: 'Chapinero', address: 'Calle 57 # 13-25', phone: '6017400001', city: 'Bogotá', department: 'Cundinamarca',
                staff: staffFor('chapinero', '30041001', ['Liliana', 'Suárez', 'FEMALE'], ['Brayan', 'Castro', 'MALE'], ['Edgar', 'Rojas', 'MALE']),
            },
        ],
        inventory: [
            { name: 'Harina de maíz', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '15000', totalCostPerBranch: '52500', minGlobalStock: '4000' },
            { name: 'Queso mozzarella', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '5000', totalCostPerBranch: '110000', expiresInDays: 12, minGlobalStock: '6000' },
            { name: 'Mantequilla', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '2000', totalCostPerBranch: '44000', expiresInDays: 30 },
            { name: 'Mora', unitOfMeasure: 'GRAM', isPerishable: true, quantityPerBranch: '4000', totalCostPerBranch: '32000', expiresInDays: 5, minGlobalStock: '1000' },
            { name: 'Azúcar', unitOfMeasure: 'GRAM', isPerishable: false, quantityPerBranch: '5000', totalCostPerBranch: '20000' },
            { name: 'Vaso desechable', unitOfMeasure: 'UNIT', isPerishable: false, quantityPerBranch: '300', totalCostPerBranch: '45000', minGlobalStock: '100' },
        ],
        categories: [
            {
                name: 'Arepas',
                description: 'Arepas asadas en budare.',
                products: [
                    { name: 'Arepa con queso', description: 'Arepa de maíz rellena de mozzarella.', basePrice: '7000', profitMargin: '55', recipe: [{ item: 'Harina de maíz', quantity: '120' }, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Mantequilla', quantity: '10', isOptional: true }] },
                    { name: 'Arepa sencilla', description: 'Arepa de maíz con mantequilla.', basePrice: '3500', profitMargin: '60', recipe: [{ item: 'Harina de maíz', quantity: '120' }, { item: 'Mantequilla', quantity: '10' }] },
                ],
            },
            {
                name: 'Jugos naturales',
                description: 'Jugos en agua preparados al momento.',
                products: [
                    { name: 'Jugo de mora', description: 'Jugo de mora en agua.', basePrice: '5000', profitMargin: '60', recipe: [{ item: 'Mora', quantity: '150' }, { item: 'Azúcar', quantity: '20', isOptional: true }, { item: 'Vaso desechable', quantity: '1' }] },
                ],
            },
            {
                name: 'Para llevar',
                description: 'Combos empacados para llevar.',
                products: [
                    { name: 'Combo arepa y jugo', description: 'Arepa con queso y jugo de mora.', basePrice: '11000', profitMargin: '50', recipe: [{ item: 'Harina de maíz', quantity: '120' }, { item: 'Queso mozzarella', quantity: '60' }, { item: 'Mora', quantity: '150' }, { item: 'Vaso desechable', quantity: '1' }] },
                ],
            },
        ],
    },
];

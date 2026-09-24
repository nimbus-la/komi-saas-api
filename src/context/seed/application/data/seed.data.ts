/**
 * Datos de prueba que siembra `POST /seed`.
 *
 * Aquí solo hay datos, nada de lógica. Para cambiar un nombre, agregar un insumo
 * o un producto basta con editar este archivo. Las referencias entre datos van
 * por nombre (la sucursal de un usuario, el insumo de una receta) porque los ids
 * se generan al crear cada cosa.
 */

import { CREPERIA_LA_ALAMEDA } from './creperia-la-alameda.data';


/** Contraseña de todos los usuarios sembrados. Cumple las reglas de `UserPlainPassword`. */
export const SEED_PASSWORD = 'Komi12345678';


export type SeedRolCode = 'OWNER' | 'ADMIN' | 'SUPERVISOR' | 'CASHIER' | 'WAITER' | 'KITCHEN';


/**
 * Personas inventadas con datos creíbles. El nombre de usuario sale del primer
 * nombre y el primer apellido, sin tildes, porque `UserName` no las acepta.
 */
export interface SeedUser {
    rol: SeedRolCode;
    userName: string;
    email: string;
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
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


export const SEED_TENANTS: SeedTenant[] = [
    {
        name: 'Sabor Criollo',
        description: 'Restaurante de comida típica colombiana con tres sedes en Medellín.',
        slug: 'sabor-criollo',
        nit: '900555101-1',
        administrators: [
            { rol: 'OWNER', userName: 'carlos.restrepo', email: 'carlos.restrepo@gmail.com', firstName: 'Carlos', secondName: 'Andrés', firstLastName: 'Restrepo', secondLastName: 'Uribe', sex: 'MALE', birthDate: '1975-02-10', phone: '3104587321' },
            { rol: 'ADMIN', userName: 'diana.cardona', email: 'diana.cardona@hotmail.com', firstName: 'Diana', secondName: 'Marcela', firstLastName: 'Cardona', secondLastName: 'Villa', sex: 'FEMALE', birthDate: '1985-06-18', phone: '3157742906' },
            { rol: 'SUPERVISOR', userName: 'jorge.mejia', email: 'jorge.mejia@outlook.com', firstName: 'Jorge', secondName: 'Iván', firstLastName: 'Mejía', secondLastName: 'Ochoa', sex: 'MALE', birthDate: '1988-09-30', phone: '3006198453' },
        ],
        branches: [
            {
                name: 'Centro', address: 'Carrera 50 # 52-20', phone: '6045110001', city: 'Medellín', department: 'Antioquia',
                staff: [
                    { rol: 'CASHIER', userName: 'laura.gomez', email: 'laura.gomez@gmail.com', firstName: 'Laura', secondName: 'Cristina', firstLastName: 'Gómez', secondLastName: 'Álvarez', sex: 'FEMALE', birthDate: '1996-03-14', phone: '3012456789' },
                    { rol: 'WAITER', userName: 'andres.ruiz', email: 'andres.ruiz@gmail.com', firstName: 'Andrés', secondName: 'Felipe', firstLastName: 'Ruiz', secondLastName: 'Montoya', sex: 'MALE', birthDate: '1999-07-22', phone: '3208871234' },
                    { rol: 'KITCHEN', userName: 'marta.diaz', email: 'marta.diaz@hotmail.com', firstName: 'Marta', secondName: 'Lucía', firstLastName: 'Díaz', secondLastName: 'Posada', sex: 'FEMALE', birthDate: '1983-11-05', phone: '3116034572' },
                ],
            },
            {
                name: 'Laureles', address: 'Circular 1 # 70-15', phone: '6045110002', city: 'Medellín', department: 'Antioquia',
                staff: [
                    { rol: 'CASHIER', userName: 'sofia.arango', email: 'sofia.arango@gmail.com', firstName: 'Sofía', firstLastName: 'Arango', secondLastName: 'Betancur', sex: 'FEMALE', birthDate: '1997-01-29', phone: '3045319087' },
                    { rol: 'WAITER', userName: 'juan.osorio', email: 'juan.osorio@gmail.com', firstName: 'Juan', secondName: 'Felipe', firstLastName: 'Osorio', secondLastName: 'Londoño', sex: 'MALE', birthDate: '2000-05-17', phone: '3182260945' },
                    { rol: 'KITCHEN', userName: 'luis.zapata', email: 'luis.zapata@outlook.com', firstName: 'Luis', secondName: 'Alberto', firstLastName: 'Zapata', secondLastName: 'Correa', sex: 'MALE', birthDate: '1979-08-12', phone: '3137785016' },
                ],
            },
            {
                name: 'Envigado', address: 'Calle 38 Sur # 43-10', phone: '6045110003', city: 'Envigado', department: 'Antioquia',
                staff: [
                    { rol: 'CASHIER', userName: 'paula.velez', email: 'paula.velez@gmail.com', firstName: 'Paula', secondName: 'Andrea', firstLastName: 'Vélez', secondLastName: 'Rendón', sex: 'FEMALE', birthDate: '1995-10-03', phone: '3219054378' },
                    { rol: 'WAITER', userName: 'camilo.henao', email: 'camilo.henao@hotmail.com', firstName: 'Camilo', firstLastName: 'Henao', secondLastName: 'Gil', sex: 'MALE', birthDate: '2001-02-26', phone: '3053367812' },
                    { rol: 'KITCHEN', userName: 'rosa.castano', email: 'rosa.castano@gmail.com', firstName: 'Rosa', secondName: 'Elena', firstLastName: 'Castaño', secondLastName: 'Muñoz', sex: 'FEMALE', birthDate: '1976-12-08', phone: '3148806231' },
                ],
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
            { rol: 'OWNER', userName: 'ricardo.barrios', email: 'ricardo.barrios@gmail.com', firstName: 'Ricardo', secondName: 'José', firstLastName: 'Barrios', secondLastName: 'Consuegra', sex: 'MALE', birthDate: '1970-04-03', phone: '3006671290' },
            { rol: 'ADMIN', userName: 'natalia.pertuz', email: 'natalia.pertuz@hotmail.com', firstName: 'Natalia', firstLastName: 'Pertuz', secondLastName: 'Charris', sex: 'FEMALE', birthDate: '1987-12-01', phone: '3014490318' },
            { rol: 'SUPERVISOR', userName: 'hernan.charris', email: 'hernan.charris@gmail.com', firstName: 'Hernán', secondName: 'Darío', firstLastName: 'Charris', secondLastName: 'Molina', sex: 'MALE', birthDate: '1983-08-25', phone: '3157012684' },
        ],
        branches: [
            {
                name: 'Alto Prado', address: 'Carrera 53 # 79-45', phone: '6053600001', city: 'Barranquilla', department: 'Atlántico',
                staff: [
                    { rol: 'CASHIER', userName: 'yuliana.mendoza', email: 'yuliana.mendoza@gmail.com', firstName: 'Yuliana', firstLastName: 'Mendoza', secondLastName: 'Ariza', sex: 'FEMALE', birthDate: '1998-06-11', phone: '3205578142' },
                    { rol: 'WAITER', userName: 'kevin.orozco', email: 'kevin.orozco@gmail.com', firstName: 'Kevin', secondName: 'Andrés', firstLastName: 'Orozco', secondLastName: 'Rada', sex: 'MALE', birthDate: '2002-09-19', phone: '3043318870' },
                    { rol: 'KITCHEN', userName: 'wilson.polo', email: 'wilson.polo@hotmail.com', firstName: 'Wilson', secondName: 'Enrique', firstLastName: 'Polo', secondLastName: 'Barraza', sex: 'MALE', birthDate: '1981-04-27', phone: '3116620459' },
                ],
            },
            {
                name: 'Malecón', address: 'Vía 40 # 36-120', phone: '6053600002', city: 'Barranquilla', department: 'Atlántico',
                staff: [
                    { rol: 'CASHIER', userName: 'karen.ospino', email: 'karen.ospino@gmail.com', firstName: 'Karen', secondName: 'Julieth', firstLastName: 'Ospino', secondLastName: 'Gutiérrez', sex: 'FEMALE', birthDate: '1997-11-02', phone: '3017745031' },
                    { rol: 'WAITER', userName: 'jesus.maestre', email: 'jesus.maestre@outlook.com', firstName: 'Jesús', secondName: 'David', firstLastName: 'Maestre', secondLastName: 'Pinto', sex: 'MALE', birthDate: '1999-03-08', phone: '3002215867' },
                    { rol: 'KITCHEN', userName: 'ana.fontalvo', email: 'ana.fontalvo@gmail.com', firstName: 'Ana', secondName: 'Milena', firstLastName: 'Fontalvo', secondLastName: 'Rojano', sex: 'FEMALE', birthDate: '1985-07-15', phone: '3128853406' },
                ],
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
            { rol: 'OWNER', userName: 'valentina.giraldo', email: 'valentina.giraldo@gmail.com', firstName: 'Valentina', firstLastName: 'Giraldo', secondLastName: 'Arias', sex: 'FEMALE', birthDate: '1982-01-27', phone: '3136652047' },
            { rol: 'ADMIN', userName: 'mateo.salazar', email: 'mateo.salazar@outlook.com', firstName: 'Mateo', secondName: 'Alejandro', firstLastName: 'Salazar', secondLastName: 'Duque', sex: 'MALE', birthDate: '1990-05-09', phone: '3174410863' },
            { rol: 'SUPERVISOR', userName: 'lorena.ocampo', email: 'lorena.ocampo@gmail.com', firstName: 'Lorena', secondName: 'Patricia', firstLastName: 'Ocampo', secondLastName: 'Franco', sex: 'FEMALE', birthDate: '1992-10-14', phone: '3108897325' },
        ],
        branches: [
            {
                name: 'Cable', address: 'Carrera 23 # 65-10', phone: '6068800001', city: 'Manizales', department: 'Caldas',
                staff: [
                    { rol: 'CASHIER', userName: 'daniela.marin', email: 'daniela.marin@gmail.com', firstName: 'Daniela', firstLastName: 'Marín', secondLastName: 'Quintero', sex: 'FEMALE', birthDate: '2000-04-21', phone: '3226031948' },
                    { rol: 'WAITER', userName: 'santiago.toro', email: 'santiago.toro@hotmail.com', firstName: 'Santiago', firstLastName: 'Toro', secondLastName: 'Valencia', sex: 'MALE', birthDate: '2001-08-30', phone: '3015582470' },
                    { rol: 'KITCHEN', userName: 'oscar.ramirez', email: 'oscar.ramirez@gmail.com', firstName: 'Óscar', secondName: 'Mauricio', firstLastName: 'Ramírez', secondLastName: 'Hoyos', sex: 'MALE', birthDate: '1986-02-17', phone: '3145509813' },
                ],
            },
            {
                name: 'Chipre', address: 'Avenida 12 de Octubre # 3-40', phone: '6068800002', city: 'Manizales', department: 'Caldas',
                staff: [
                    { rol: 'CASHIER', userName: 'juliana.loaiza', email: 'juliana.loaiza@gmail.com', firstName: 'Juliana', firstLastName: 'Loaiza', secondLastName: 'Cardona', sex: 'FEMALE', birthDate: '1996-12-05', phone: '3187263051' },
                    { rol: 'WAITER', userName: 'tomas.echeverri', email: 'tomas.echeverri@gmail.com', firstName: 'Tomás', firstLastName: 'Echeverri', secondLastName: 'Ríos', sex: 'MALE', birthDate: '2002-01-13', phone: '3051147698' },
                    { rol: 'KITCHEN', userName: 'gloria.aristizabal', email: 'gloria.aristizabal@hotmail.com', firstName: 'Gloria', secondName: 'Inés', firstLastName: 'Aristizábal', secondLastName: 'Gallego', sex: 'FEMALE', birthDate: '1974-09-24', phone: '3119928304' },
                ],
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
            { rol: 'OWNER', userName: 'rosa.pardo', email: 'rosa.pardo@gmail.com', firstName: 'Rosa', secondName: 'María', firstLastName: 'Pardo', secondLastName: 'Cely', sex: 'FEMALE', birthDate: '1968-03-08', phone: '3002873514' },
            { rol: 'ADMIN', userName: 'miguel.pardo', email: 'miguel.pardo@gmail.com', firstName: 'Miguel', secondName: 'Ángel', firstLastName: 'Pardo', secondLastName: 'Cely', sex: 'MALE', birthDate: '1994-07-19', phone: '3167345092' },
            { rol: 'SUPERVISOR', userName: 'clara.rincon', email: 'clara.rincon@outlook.com', firstName: 'Clara', secondName: 'Inés', firstLastName: 'Rincón', secondLastName: 'Forero', sex: 'FEMALE', birthDate: '1989-02-11', phone: '3124486715' },
        ],
        branches: [
            {
                name: 'Chapinero', address: 'Calle 57 # 13-25', phone: '6017400001', city: 'Bogotá', department: 'Cundinamarca',
                staff: [
                    { rol: 'CASHIER', userName: 'liliana.suarez', email: 'liliana.suarez@gmail.com', firstName: 'Liliana', firstLastName: 'Suárez', secondLastName: 'Bernal', sex: 'FEMALE', birthDate: '1993-05-28', phone: '3209916473' },
                    { rol: 'WAITER', userName: 'brayan.castro', email: 'brayan.castro@hotmail.com', firstName: 'Brayan', secondName: 'Stiven', firstLastName: 'Castro', secondLastName: 'Moreno', sex: 'MALE', birthDate: '2003-10-06', phone: '3046678129' },
                    { rol: 'KITCHEN', userName: 'edgar.rojas', email: 'edgar.rojas@gmail.com', firstName: 'Edgar', firstLastName: 'Rojas', secondLastName: 'Peña', sex: 'MALE', birthDate: '1980-06-02', phone: '3113305867' },
                ],
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

    // Negocio grande, en su propio archivo por el tamaño de su catálogo.
    CREPERIA_LA_ALAMEDA,
];

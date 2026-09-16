import { EventPublisher, Money, Quantity } from "@/shared";

import { TenantAggregate, TenantDescription, TenantName, TenantNit, TenantRepository, TenantSlug } from "@/context/tenants/domain";
import { BranchAddress, BranchAggregate, BranchCity, BranchDepartment, BranchName, BranchPhone, BranchRepository } from "@/context/branch/domain";
import { RolRepository } from "@/context/rol/domain/rol.repository";
import {
    UserAggregate,
    UserBirthDate,
    UserBranchId,
    UserEmail,
    UserHashedPassword,
    UserName,
    UserPhone,
    UserPlainPassword,
    UserRepository,
    UserRolId,
    UserRolNotFoundException,
    UserRolScope,
    UserSex,
    UserTenantId,
} from "@/context/user/domain";
import { PasswordHasher } from "@/context/user/application/ports/password-hasher";
import {
    DEFAULT_CURRENCY,
    InventoryBatchExpirationDate,
    InventoryItem,
    InventoryItemName,
    InventoryItemRepository,
    InventoryItemSku,
    InventoryItemUnit,
} from "@/context/inventory/domain";
import { CategoryName, ProductCategory, ProductCategoryRepository } from "@/context/product-categories/domain";
import { Product, ProductRepository } from "@/context/products/domain";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { ProductSku } from "@/context/products/domain/value-object/product-sku.value-object";
import { ProfitMargin } from "@/context/products/domain/value-object/profit-margin.value-object";

import { SEED_PASSWORD, SEED_TENANTS, SeedCategory, SeedInventoryItem, SeedTenant, SeedUser } from "../../data/seed.data";
import { SeedDataCleaner } from "../../ports/seed-data-cleaner";


export interface SeedTenantSummary {
    name: string;
    slug: string;
    branches: string[];
    users: string[];
    inventoryItems: number;
    products: number;
}


interface SeedRol {
    id: string;
    name: string;
    scope: UserRolScope;
}


const DAY_IN_MS = 24 * 60 * 60 * 1000;


/**
 * Siembra los negocios de prueba definidos en `seed.data.ts`.
 *
 * Arma cada cosa con la fábrica de su agregado y la guarda con su repositorio.
 * No pasa por los casos de uso de creación porque esos no devuelven el id de lo
 * que crean, y aquí cada paso necesita el id del anterior: el usuario el de su
 * sucursal, el lote el de su insumo, la receta el de sus insumos.
 */
export class RunSeedUseCase {
    constructor(
        private readonly cleaner: SeedDataCleaner,
        private readonly tenants: TenantRepository,
        private readonly branches: BranchRepository,
        private readonly roles: RolRepository,
        private readonly users: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly inventoryItems: InventoryItemRepository,
        private readonly categories: ProductCategoryRepository,
        private readonly products: ProductRepository,
        private readonly eventPublisher: EventPublisher,
    ) { }


    public async execute(): Promise<SeedTenantSummary[]> {
        // Se borra primero para que el endpoint se pueda llamar las veces que haga
        // falta sin chocar con los nombres, slugs y NIT que ya existen.
        await this.cleaner.removeTenantsBySlug(SEED_TENANTS.map((tenant) => tenant.slug));

        const roles = await this.loadRoles();

        // Un solo hash para todos los usuarios. Argon2 es lento a propósito, y
        // repetirlo por cada usuario solo alarga la espera sin aportar nada en
        // datos de desarrollo.
        const passwordHash = UserHashedPassword.fromHash(
            await this.passwordHasher.hash(UserPlainPassword.create(SEED_PASSWORD)),
        );

        const summary: SeedTenantSummary[] = [];

        for (const data of SEED_TENANTS) {
            summary.push(await this.seedTenant(data, roles, passwordHash));
        }

        return summary;
    }


    private async seedTenant(
        data: SeedTenant,
        roles: Map<string, SeedRol>,
        passwordHash: UserHashedPassword,
    ): Promise<SeedTenantSummary> {
        const tenant = TenantAggregate.create({
            name: TenantName.create(data.name),
            description: TenantDescription.create(data.description),
            slug: TenantSlug.create(data.slug),
            nit: TenantNit.create(data.nit),
        });

        await this.tenants.save(tenant);

        const tenantId = tenant.id.value;
        const branchIds = await this.seedBranches(tenantId, data);

        const userNames: string[] = [];

        for (const user of data.administrators) {
            await this.seedUser(tenantId, null, user, roles, passwordHash);
            userNames.push(user.userName);
        }

        for (const branch of data.branches) {
            const branchId = this.requireId(branchIds, branch.name, `la sucursal "${branch.name}"`);

            for (const user of branch.staff) {
                await this.seedUser(tenantId, branchId, user, roles, passwordHash);
                userNames.push(user.userName);
            }
        }

        const itemIds = new Map<string, string>();

        for (const item of data.inventory) {
            itemIds.set(item.name, await this.seedInventoryItem(tenantId, item, branchIds));
        }

        let productCount = 0;

        for (const category of data.categories) {
            productCount += await this.seedCategory(tenantId, category, itemIds);
        }

        return {
            name: data.name,
            slug: data.slug,
            branches: data.branches.map((branch) => branch.name),
            users: userNames,
            inventoryItems: itemIds.size,
            products: productCount,
        };
    }


    private async seedBranches(tenantId: string, data: SeedTenant): Promise<Map<string, string>> {
        const branchIds = new Map<string, string>();

        for (const branch of data.branches) {
            const aggregate = BranchAggregate.create({
                tenantId,
                name: BranchName.create(branch.name),
                address: BranchAddress.create(branch.address),
                phone: BranchPhone.create(branch.phone),
                city: BranchCity.create(branch.city),
                department: BranchDepartment.create(branch.department),
            });

            await this.branches.save(aggregate);
            branchIds.set(branch.name, aggregate.id.value);
        }

        return branchIds;
    }


    private async seedUser(
        tenantId: string,
        branchId: string | null,
        data: SeedUser,
        roles: Map<string, SeedRol>,
        passwordHash: UserHashedPassword,
    ): Promise<void> {
        const rol = roles.get(data.rol);

        if (!rol) {
            throw new UserRolNotFoundException(data.rol);
        }

        // El agregado valida que los roles administrativos no lleven sucursal y
        // los operativos sí, así que un error en los datos se detecta aquí.
        const user = UserAggregate.create({
            tenantId: UserTenantId.create(tenantId),
            branchId: branchId ? UserBranchId.create(branchId) : null,
            rolId: UserRolId.create(rol.id),
            rolName: rol.name,
            rolScope: rol.scope,
            userName: UserName.create(data.userName),
            email: UserEmail.create(data.email),
            password: passwordHash,
            firstName: data.firstName,
            secondName: data.secondName ?? null,
            firstLastName: data.firstLastName,
            secondLastName: data.secondLastName ?? null,
            age: UserBirthDate.create(data.birthDate),
            sex: UserSex.create(data.sex),
            phone: UserPhone.create(data.phone),
        });

        await this.users.save(user);
    }


    private async seedInventoryItem(
        tenantId: string,
        data: SeedInventoryItem,
        branchIds: Map<string, string>,
    ): Promise<string> {
        const item = InventoryItem.create({
            tenantId,
            sku: InventoryItemSku.fromNumber(await this.inventoryItems.nextSkuSequence()),
            name: InventoryItemName.create(data.name),
            unitOfMeasure: InventoryItemUnit.create(data.unitOfMeasure),
            isPerishable: data.isPerishable,
        });

        const quantity = Quantity.of(data.quantityPerBranch);
        const unitCost = Money.of(data.totalCostPerBranch, DEFAULT_CURRENCY).divide(quantity.getValue());

        // Los perecederos vencen contando desde hoy, para que el lote siga vigente
        // sin importar cuándo se corra el seed.
        const expirationDate = data.isPerishable
            ? InventoryBatchExpirationDate.create(new Date(Date.now() + (data.expiresInDays ?? 7) * DAY_IN_MS))
            : null;

        for (const branchId of branchIds.values()) {
            item.recivedBatch({ branchId, quantityReceived: quantity, unitCost, expirationDate });
        }

        if (data.minGlobalStock !== undefined) {
            item.setGlobalMinimum(Quantity.of(data.minGlobalStock));
        }

        if (data.branchMinimum !== undefined) {
            const branchId = this.requireId(
                branchIds,
                data.branchMinimum.branch,
                `la sucursal "${data.branchMinimum.branch}" del mínimo de "${data.name}"`,
            );

            item.setMinimumForBranch(branchId, Quantity.of(data.branchMinimum.minStock));
        }

        await this.inventoryItems.save(item);

        // Cada lote registró un evento de mercancía recibida. Publicarlo hace que
        // inventory-movements escriba la bitácora igual que en una recepción real.
        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();

        return item.id.value;
    }


    private async seedCategory(
        tenantId: string,
        data: SeedCategory,
        itemIds: Map<string, string>,
    ): Promise<number> {
        const category = ProductCategory.create({
            tenantId,
            name: CategoryName.create(data.name),
            description: data.description,
        });

        await this.categories.save(category);

        for (const productData of data.products) {
            const product = Product.create({
                tenantId,
                productCategoryId: category.id.value,
                productName: ProductName.create(productData.name),
                productDescription: productData.description,
                productSku: ProductSku.fromNumber(await this.products.nextSkuSequence()),
                productImgUrl: undefined,
                productBasePrice: Money.of(productData.basePrice),
                profitMargin: ProfitMargin.create(productData.profitMargin),
            });

            for (const ingredient of productData.recipe) {
                product.addIngredient({
                    inventoryItemId: this.requireId(
                        itemIds,
                        ingredient.item,
                        `el insumo "${ingredient.item}" de la receta de "${productData.name}"`,
                    ),
                    quantity: Quantity.of(ingredient.quantity),
                    isOptional: ingredient.isOptional ?? false,
                });
            }

            await this.products.save(product);

            await this.eventPublisher.publish(product.getDomainEvents());
            product.clearDomainEvents();
        }

        return data.products.length;
    }


    /** Los usuarios guardan el nombre y el alcance del rol, así que se leen una sola vez de la tabla. */
    private async loadRoles(): Promise<Map<string, SeedRol>> {
        const roles = await this.roles.searchAll();

        return new Map(roles.map((rol) => [
            rol.code,
            { id: rol.id, name: rol.name, scope: UserRolScope.create(rol.scope) },
        ]));
    }


    /**
     * Resuelve una referencia por nombre dentro de los datos del seed. Si falla es
     * un error de escritura en `seed.data.ts`, y el mensaje dice cuál.
     */
    private requireId(ids: Map<string, string>, name: string, description: string): string {
        const id = ids.get(name);

        if (id === undefined) {
            throw new Error(`No se encontró ${description} en los datos del seed.`);
        }

        return id;
    }
}

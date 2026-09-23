import { AggregateRoot } from "@/shared";
import { BranchAddress, BranchCity, BranchDepartment, BranchId, BranchName, BranchPhone} from "./value-object";
import { BranchPrimitives } from "./types";
import { BranchAlreadyActiveException, BranchAlreadyInactiveException, BranchEmptyUpdateException, BranchFieldUnchangedException } from "./exceptions/branch-exceptions";



export class BranchAggregate  extends AggregateRoot<BranchId>{

    private readonly tenantId: string;
    private name: BranchName;
    private address: BranchAddress;
    private phone: BranchPhone;
    private city: BranchCity;
    private department: BranchDepartment;
    private isActive: boolean;
    private isDeleted: boolean;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: BranchId,
        tenantId: string,
        name: BranchName,
        address: BranchAddress,
        phone: BranchPhone,
        city: BranchCity,
        department: BranchDepartment,
        isActive: boolean,
        isDeleted: boolean,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.city = city;
        this.department = department;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    public static create(params: {
        tenantId: string;
        name: BranchName;
        address: BranchAddress;
        phone: BranchPhone;
        city: BranchCity;
        department: BranchDepartment;
        createdAt?: Date;
    }): BranchAggregate {
        const now = new Date();

        return new BranchAggregate(
            BranchId.generate(),
            params.tenantId,
            params.name,
            params.address,
            params.phone,
            params.city,
            params.department,
            true,
            false,
            now,
            now
        );
    }

    public toPrimitives(): BranchPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            name: this.name.value,
            address: this.address.value,
            phone: this.phone.value,
            city: this.city.value,
            department: this.department.value,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    public static fromPrimitives(primitives: BranchPrimitives): BranchAggregate {
        return new BranchAggregate(
            BranchId.create(primitives.id),
            primitives.tenantId,
            BranchName.create(primitives.name),
            BranchAddress.create(primitives.address),
            BranchPhone.create(primitives.phone),
            BranchCity.create(primitives.city),
            BranchDepartment.create(primitives.department),
            primitives.isActive,
            primitives.isDeleted,
            primitives.createdAt,
            primitives.updatedAt,
        );
    }

    public update(params: {
        name?: BranchName;
        address?: BranchAddress;
        phone?: BranchPhone;
        city?: BranchCity;
        department?: BranchDepartment;
        isActive?: boolean;
    }): void {

        if (Object.keys(params).length === 0) {
            throw new BranchEmptyUpdateException(this.id.value);
        }

        // Se compara el texto exacto y no con equals(), que ignora mayúsculas:
        // corregir "centro" por "Centro" es un cambio válido.
        const unchanged = [
            { field: 'nombre', sent: params.name, current: this.name },
            { field: 'dirección', sent: params.address, current: this.address },
            { field: 'teléfono', sent: params.phone, current: this.phone },
            { field: 'ciudad', sent: params.city, current: this.city },
            { field: 'departamento', sent: params.department, current: this.department },
        ].find(({ sent, current }) => sent?.value === current.value);

        if (unchanged) {
            throw new BranchFieldUnchangedException(unchanged.field);
        }

        // Va antes de asignar los demás campos: si el estado ya es el pedido,
        // lanza 1216/1217 sin dejar el agregado a medio cambiar.
        if (params.isActive === true) {
            this.activate();
        } else if (params.isActive === false) {
            this.deactivate();
        }

        if (params.name) {
            this.name = params.name;
        }

        if (params.address) {
            this.address = params.address;
        }

        if (params.phone) {
            this.phone = params.phone;
        }

        if (params.city) {
            this.city = params.city;
        }

        if (params.department) {
            this.department = params.department;
        }
    
        this.touch();
    }

    public deactivate(): void {
        if (!this.isActive) {
            throw new BranchAlreadyInactiveException(this.id.value);
        }

        this.isActive = false;
    }

    public activate(): void {
        if (this.isActive) {
            throw new BranchAlreadyActiveException(this.id.value);
        }

        this.isActive = true;
    }

    /**
     * Borrado lógico: la fila se queda porque users e inventario la referencian.
     * No se revisa si ya estaba eliminada porque el repositorio nunca devuelve
     * sucursales eliminadas; eliminar dos veces responde 1207.
     */
    public delete(): void {
        this.isDeleted = true;
        this.touch();
    }

    /** Mismo nombre sin importar mayúsculas: "centro" y "Centro" son el mismo. */
    public hasName(name: BranchName): boolean {
        return this.name.equals(name);
    }

    public get active(): boolean {
        return this.isActive;
    }
}
import { TenantCheckerAdapter } from './tenant-checker.adapter';


/**
 * Pruebas del adaptador que traduce el puerto TenantChecker al repositorio de
 * tenants: el caso de uso solo necesita un sí o un no.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';


describe('TenantCheckerAdapter', () => {
    it('responde true si el repositorio encuentra el negocio', async () => {
        const searchById = jest.fn().mockResolvedValue({ id: TENANT_ID });

        await expect(new TenantCheckerAdapter({ searchById } as never).exists(TENANT_ID)).resolves.toBe(true);
        expect(searchById).toHaveBeenCalledWith(expect.objectContaining({ value: TENANT_ID }));
    });

    it('responde false si el repositorio no lo encuentra', async () => {
        const searchById = jest.fn().mockResolvedValue(null);

        await expect(new TenantCheckerAdapter({ searchById } as never).exists(TENANT_ID)).resolves.toBe(false);
    });
});

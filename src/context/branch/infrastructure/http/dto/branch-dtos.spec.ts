import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { DeleteBranchDto } from './delete-branch.dto';
import { SearchBranchesDto } from './search-branches.dto';
import { UpdateBranchDto } from './update-branch.dto';


/**
 * Pruebas de los DTO de sucursales con las mismas opciones del ValidationPipe
 * global (whitelist y forbidNonWhitelisted).
 *
 * Devuelven la lista de campos rechazados para que cada caso diga exactamente
 * qué falló.
 */

const BRANCH_ID = '8f14e45f-ceea-467a-9575-4b2c1d2a3f10';

const rejected = <T extends object>(dto: new () => T, plain: object): string[] =>
    validateSync(plainToInstance(dto, plain), { whitelist: true, forbidNonWhitelisted: true })
        .map((error) => error.property);


describe('SearchBranchesDto', () => {
    it('sin query usa la página 1 de 20', () => {
        const dto = plainToInstance(SearchBranchesDto, {});

        expect(rejected(SearchBranchesDto, {})).toEqual([]);
        expect([dto.pageNumber, dto.pageSize]).toEqual([1, 20]);
    });

    it('convierte los strings del query a número y booleano', () => {
        const dto = plainToInstance(SearchBranchesDto, {
            pageNumber: '2',
            pageSize: '5',
            branchStatus: 'false',
        });

        expect([dto.pageNumber, dto.pageSize, dto.branchStatus]).toEqual([2, 5, false]);
    });

    it.each([
        ['pageNumber', { pageNumber: '0' }],
        ['pageSize', { pageSize: 'abc' }],
        ['pageSize', { pageSize: '100000' }],
        ['branchStatus', { branchStatus: 'activo' }],
        ['branchId', { branchId: 'abc' }],
        ['tenantId', { tenantId: BRANCH_ID }],
    ])('rechaza %s en %j', (field, plain) => {
        expect(rejected(SearchBranchesDto, plain)).toEqual([field]);
    });
});


describe('UpdateBranchDto', () => {
    it('acepta solo el branchId y los campos que cambian', () => {
        expect(rejected(UpdateBranchDto, { branchId: BRANCH_ID, city: 'Palmira', isActive: false })).toEqual([]);
    });

    it('acepta en el teléfono los mismos caracteres que al crear', () => {
        expect(rejected(UpdateBranchDto, { branchId: BRANCH_ID, phone: '+57 (300) 123' })).toEqual([]);
    });

    it.each([
        ['branchId', {}],
        ['name', { branchId: BRANCH_ID, name: 'a'.repeat(31) }],
        ['address', { branchId: BRANCH_ID, address: 'abc' }],
        ['phone', { branchId: BRANCH_ID, phone: '300-abc-123' }],
        ['city', { branchId: BRANCH_ID, city: 'a'.repeat(51) }],
        ['isActive', { branchId: BRANCH_ID, isActive: 'false' }],
        ['tenantId', { branchId: BRANCH_ID, tenantId: BRANCH_ID }],
    ])('rechaza %s en %j', (field, plain) => {
        expect(rejected(UpdateBranchDto, plain)).toEqual([field]);
    });
});


describe('DeleteBranchDto', () => {
    it('acepta un UUID', () => {
        expect(rejected(DeleteBranchDto, { branchId: BRANCH_ID })).toEqual([]);
    });

    it.each([
        ['branchId', {}],
        ['branchId', { branchId: 'abc' }],
        ['tenantId', { branchId: BRANCH_ID, tenantId: BRANCH_ID }],
    ])('rechaza %s en %j', (field, plain) => {
        expect(rejected(DeleteBranchDto, plain)).toEqual([field]);
    });
});

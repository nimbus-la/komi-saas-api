export interface InventoryItemCreatedProps {
    itemId: string;
    name: string;
    unitOfMeasure: string;
    costAmount: string;
    costCurrency: string;
    isPerishable: boolean;
    isActive: boolean;
    createdAt: Date;
};
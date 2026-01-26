// src/modules/sales/domain/models/sale.ts
export interface Sale {
    id: string;
    customerId: string;
    items: SaleItem[];
    totalAmount: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
}

export interface SaleItem {
    productId: string;
    quantity: number;
    price: number;
}

// src/modules/sales/domain/ports/inventory-service.ts
export interface IInventoryService {
    checkAvailability(productId: string, quantity: number): Promise<boolean>;
}

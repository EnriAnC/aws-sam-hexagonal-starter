export interface Sale {
    id: string;
    customerId: string;
    items: SaleItem[];
    subtotal: number;
    taxes: number;
    totalAmount: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: Date;
}

export interface SaleItem {
    productId: string;
    quantity: number;
    price: number;
}

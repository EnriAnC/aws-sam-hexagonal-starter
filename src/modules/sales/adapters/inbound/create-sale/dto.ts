export interface CreateSaleRequest {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}

export const validateCreateSaleRequest = (data: any): CreateSaleRequest => {
    if (!data.customerId) throw new Error('Missing customerId');
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('Items must be a non-empty array');

    // Aquí podrías usar Zod o Joi para una validación más robusta
    return data as CreateSaleRequest;
};

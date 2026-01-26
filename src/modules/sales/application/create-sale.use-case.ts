// src/modules/sales/application/create-sale.use-case.ts

import { Sale } from "../domain/models/sale";
import { ISaleRepository } from "../domain/repository";

export class CreateSaleUseCase {
    constructor(private saleRepository: ISaleRepository) { }

    async execute(input: any): Promise<Sale> {
        // 1. Business Logic / Validation
        const sale: Sale = {
            id: Math.random().toString(36).substring(7),
            customerId: input.customerId,
            items: input.items,
            totalAmount: input.items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
            status: 'PENDING',
            createdAt: new Date(),
        };

        // 2. Persist using Repository (Driven Adapter)
        await this.saleRepository.save(sale);

        // 3. Return result to Handler (Primary Adapter)
        return sale;
    }
}

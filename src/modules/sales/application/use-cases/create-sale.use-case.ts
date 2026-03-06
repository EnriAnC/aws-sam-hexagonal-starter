import { Sale } from '../../domain/entities/sale.entity.ts';
import { ISaleRepository } from '../../domain/ports/sale.repository.ts';
import { SaleCalculatorService } from '../../domain/services/sale-calculator.service.ts';

export interface CreateSaleInput {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}

export class CreateSaleUseCase {
    constructor(private saleRepository: ISaleRepository) { }

    async execute(input: CreateSaleInput): Promise<Sale> {
        // 1. Delegamos el cálculo complejo al Servicio de Dominio
        const { subtotal, taxes, total } = SaleCalculatorService.calculate(input.items);

        const sale: Sale = {
            id: Math.random().toString(36).substring(7),
            customerId: input.customerId,
            items: input.items,
            subtotal,
            taxes,
            totalAmount: total,
            status: 'PENDING',
            createdAt: new Date(),
        };

        await this.saleRepository.save(sale);
        return sale;
    }
}

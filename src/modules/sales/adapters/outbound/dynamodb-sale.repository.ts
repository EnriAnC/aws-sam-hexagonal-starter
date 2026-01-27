import { Sale } from '../../domain/entities/sale.entity.js';
import { ISaleRepository } from '../../domain/ports/sale.repository.js';

export class DynamoDBSaleRepository implements ISaleRepository {
    private sales: Sale[] = [];

    async save(sale: Sale): Promise<void> {
        console.log('Saving sale to DynamoDB (Mock):', sale.id);
        this.sales.push(sale);
        return Promise.resolve();
    }

    async findById(id: string): Promise<Sale | null> {
        const sale = this.sales.find(s => s.id === id);
        return Promise.resolve(sale || null);
    }
}

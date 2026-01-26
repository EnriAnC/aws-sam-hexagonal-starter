import { Sale } from '../domain/models/sale.js';
import { ISaleRepository } from '../domain/repository.js';
import { DynamoDB } from 'aws-sdk';

const client = new DynamoDB({});

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

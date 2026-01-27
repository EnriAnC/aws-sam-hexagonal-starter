import { Sale } from '../entities/sale.entity.js';

export interface ISaleRepository {
    save(sale: Sale): Promise<void>;
    findById(id: string): Promise<Sale | null>;
}

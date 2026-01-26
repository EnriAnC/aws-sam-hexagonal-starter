import { Sale } from './models/sale.js';

export interface ISaleRepository {
    save(sale: Sale): Promise<void>;
    findById(id: string): Promise<Sale | null>;
}

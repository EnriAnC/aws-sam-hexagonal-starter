import { Sale } from '../entities/sale.entity.ts';

export interface ISaleRepository {
    save(sale: Sale): Promise<void>;
    findById(id: string): Promise<Sale | null>;
}

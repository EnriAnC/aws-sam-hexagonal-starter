import { Sale } from '../domain/models/sale.js';
import { ISaleRepository } from '../domain/repository.js';
import { getDatabaseConnection, ServiceTier } from './database.js';

export class SqlServerSaleRepository implements ISaleRepository {
    // En un ERP real, el tier vendría del contexto de la petición/usuario
    constructor(private tier: ServiceTier = 'free') { }

    async save(sale: Sale): Promise<void> {
        const pool = await getDatabaseConnection(this.tier);

        console.log(`--- SQL SERVER [TIER: ${this.tier}] ---`);
        // El pool ya está listo para usarse
        const result = await pool.request()
            .input('id', sale.id)
            .input('total', sale.totalAmount)
            .query('INSERT INTO Sales (SaleId, Total) VALUES (@id, @total)');

        console.log('Sale saved successfully');
    }

    async findById(id: string): Promise<Sale | null> {
        const pool = await getDatabaseConnection(this.tier);
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Sales WHERE SaleId = @id');

        return result.recordset[0] || null;
    }
}

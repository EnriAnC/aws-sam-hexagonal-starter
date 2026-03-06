import { Sale } from '../../domain/entities/sale.entity.ts';
import { ISaleRepository } from '../../domain/ports/sale.repository.ts';
import { getDatabaseConnection, ServiceTier } from '../../infrastructure/database.ts';

export class SqlServerSaleRepository implements ISaleRepository {
    constructor(private tier: ServiceTier = 'free') { }

    async save(sale: Sale): Promise<void> {
        const pool = await getDatabaseConnection(this.tier);

        console.log(`--- SQL SERVER ADAPTER OUTBOUND [TIER: ${this.tier}] ---`);
        const result = await pool.request()
            .input('id', sale.id)
            .input('total', sale.totalAmount)
            .query('INSERT INTO Sales (SaleId, Total) VALUES (@id, @total)');

        console.log('Sale saved successfully via SQL Server Adapter');
    }

    async findById(id: string): Promise<Sale | null> {
        const pool = await getDatabaseConnection(this.tier);
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Sales WHERE SaleId = @id');

        return result.recordset[0] || null;
    }
}

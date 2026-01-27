import { SqlServerSaleRepository } from '../outbound/sqlserver-sale.repository.js';

const repository = new SqlServerSaleRepository();

export const handler = async (event: any): Promise<any> => {
    console.log('Emitting invoice using SQL Server Inbound Adapter...', event);
    await repository.save(event);

    return {
        ...event,
        invoiceEmitted: true,
        invoiceNumber: `SQL-INV-${Math.floor(Math.random() * 1000000)}`,
        source: 'ADAPTER_INBOUND_SQL'
    };
};

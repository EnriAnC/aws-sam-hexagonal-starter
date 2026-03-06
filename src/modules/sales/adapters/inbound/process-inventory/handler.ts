import { SqlServerSaleRepository } from '../../outbound/sqlserver-sale.repository.ts';

const repository = new SqlServerSaleRepository();

export const handler = async (event: any): Promise<any> => {
    console.log('Processing inventory using SQL Server Inbound Adapter...', event);
    await repository.findById(event.saleId || '123');

    return {
        ...event,
        inventoryProcessed: true,
        source: 'ADAPTER_INBOUND_SQL'
    };
};

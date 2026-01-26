// import { Handler } from 'aws-lambda';
import { SqlServerSaleRepository } from '../../modules/sales/infrastructure/sqlserver-sale.repository';

const repository = new SqlServerSaleRepository();

export const handler: any = async (event: any) => {
    console.log('Processing inventory using SQL Server...', event);
    await repository.findById(event.saleId || '123');

    return {
        ...event,
        inventoryProcessed: true,
        source: 'SQLSERVER_LAYER'
    };
};

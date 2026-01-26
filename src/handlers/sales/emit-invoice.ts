// import { Handler } from 'aws-lambda';
import { SqlServerSaleRepository } from '../../modules/sales/infrastructure/sqlserver-sale.repository';

const repository = new SqlServerSaleRepository();

export const handler: any = async (event: any) => {
    console.log('Emitting invoice using SQL Server...', event);
    await repository.save(event);

    return {
        ...event,
        invoiceEmitted: true,
        invoiceNumber: `SQL-INV-${Math.floor(Math.random() * 1000000)}`,
        source: 'SQLSERVER_LAYER'
    };
};

// import { Handler } from 'aws-lambda';

export const handler: any = async (event: any) => {
    console.log('Emitting invoice...', event);
    return {
        ...event,
        invoiceEmitted: true,
        invoiceNumber: `INV-${Math.floor(Math.random() * 1000000)}`,
    };
};

// src/handlers/sales/create-sale.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateSaleUseCase } from '../../modules/sales/application/create-sale.use-case';
import { DynamoDBSaleRepository } from '../../modules/sales/infrastructure/dynamodb-sale.repository';

const repository = new DynamoDBSaleRepository();
const useCase = new CreateSaleUseCase(repository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}');
        const result = await useCase.execute(body);

        return {
            statusCode: 201,
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};

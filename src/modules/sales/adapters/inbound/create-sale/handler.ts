import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateSaleUseCase } from '../../../application/use-cases/create-sale.use-case.ts';
import { DynamoDBSaleRepository } from '../../outbound/dynamodb-sale.repository.ts';
import { validateCreateSaleRequest } from './dto.ts';
import { Logger } from '../../../../../shared/infrastructure/logger.ts';

const repository = new DynamoDBSaleRepository();
const useCase = new CreateSaleUseCase(repository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    Logger.info('Inbound Request: Create Sale', { path: event.path });

    try {
        const body = JSON.parse(event.body || '{}');
        const validatedData = validateCreateSaleRequest(body);

        const result = await useCase.execute(validatedData);

        return {
            statusCode: 201,
            body: JSON.stringify(result),
        };
    } catch (error) {
        Logger.error('Error handling Create Sale', error as Error);
        return {
            statusCode: (error as Error).message.includes('Missing') ? 400 : 500,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};

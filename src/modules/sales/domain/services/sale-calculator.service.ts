import { SaleItem } from '../entities/sale.entity.js';

export interface CalculationResult {
    subtotal: number;
    taxes: number;
    total: number;
}

export class SaleCalculatorService {
    private static TAX_RATE = 0.18; // Ejemplo: IVA 18%

    static calculate(items: SaleItem[]): CalculationResult {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxes = subtotal * this.TAX_RATE;
        const total = subtotal + taxes;

        return {
            subtotal: Number(subtotal.toFixed(2)),
            taxes: Number(taxes.toFixed(2)),
            total: Number(total.toFixed(2))
        };
    }
}

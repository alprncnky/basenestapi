import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';

/**
 * Response field configuration for Payment DTOs
 * Used by @AutoResponse decorator for Swagger documentation
 */
export const PaymentResponseMapping: Record<string, ResponseFieldConfig> = {
  amount: { description: 'Payment amount', example: 99.99, required: true },
  currency: { description: 'Payment currency', example: 'USD', required: true },
  status: { description: 'Payment status', example: 'completed', required: true },
  customerEmail: { description: 'Customer email', example: 'customer@example.com', required: true },
  customerName: { description: 'Customer name', example: 'John Doe', required: true },
  description: { description: 'Payment description', example: 'Payment for order #1234', required: false },
  transactionId: { description: 'Transaction ID', example: 'txn_1234567890', required: false },
};


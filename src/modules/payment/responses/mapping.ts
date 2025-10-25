import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';
import { PaymentStatusType } from '../enums/payment-status.enum';

/**
 * Response field configuration for Payment DTOs
 * Used by @AutoResponse decorator for Swagger documentation
 */
export const PaymentResponseMapping: Record<string, ResponseFieldConfig> = {
  amount: { description: 'Payment amount', example: 99.99, required: true, type: Number },
  currency: { description: 'Payment currency', example: 'USD', required: true, type: String },
  status: { description: 'Payment status', example: 'completed', required: true, enum: PaymentStatusType },
  customerEmail: { description: 'Customer email', example: 'customer@example.com', required: true, type: String },
  customerName: { description: 'Customer name', example: 'John Doe', required: true, type: String },
  description: { description: 'Payment description', example: 'Payment for order #1234', required: false, type: String },
  transactionId: { description: 'Transaction ID', example: 'txn_1234567890', required: false, type: String },
};


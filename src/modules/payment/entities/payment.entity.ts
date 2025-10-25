import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment entity with automatic property mapping
 */
@AutoEntity()
export class Payment {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail: string;
  customerName: string;
  description?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}


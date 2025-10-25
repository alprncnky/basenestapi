import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';
import { PaymentStatusType } from '../enums/payment-status.enum';

/**
 * Payment entity with automatic property mapping
 */
@AutoEntity()
export class Payment {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  customerEmail: string;
  customerName: string;
  description?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}


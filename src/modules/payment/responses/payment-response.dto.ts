import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { PaymentStatusType } from '../enums/payment-status.enum';
import { PaymentResponseMapping } from './mapping';

/**
 * Response DTO for payment details
 * Swagger documentation is defined in responses/mapping.ts
 */
@AutoResponse(PaymentResponseMapping)
export class PaymentResponseDto extends BaseResponseDto {
  amount: number;
  currency: string;
  status: PaymentStatusType;
  customerEmail: string;
  customerName: string;
  description?: string;
  transactionId?: string;
}


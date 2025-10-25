import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { PaymentStatus } from '../entities/payment.entity';

/**
 * Response DTO for payment details
 * Swagger documentation is defined in common/config/response-mappings.ts
 */
@AutoResponse('PaymentResponseDto')
export class PaymentResponseDto extends BaseResponseDto {
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail: string;
  customerName: string;
  description?: string;
  transactionId?: string;
}


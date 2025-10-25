import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { PaymentStatus } from '../entities/payment.entity';

/**
 * Response DTO for payment creation (simplified)
 * Swagger documentation is defined in common/config/response-mappings.ts
 */
@AutoResponse('PaymentCreatedResponseDto')
export class PaymentCreatedResponseDto extends BaseResponseDto {
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
}


import { BaseListResponseDto } from '../../../common/base/base-dto';
import { PaymentResponseDto } from './payment-response.dto';

/**
 * Response DTO for payment list
 * Inherits items and total from BaseListResponseDto
 */
export class PaymentListResponseDto extends BaseListResponseDto<PaymentResponseDto> {
  constructor(items: PaymentResponseDto[], total: number) {
    super(items, total);
  }
}


import { BaseListResponseDto } from '../../../common/base/base-dto';
import { PaymentResponseDto } from './payment-response.dto';

/**
 * Response DTO for payment list
 * Type alias for BaseListResponseDto with PaymentResponseDto items
 */
export class PaymentListResponseDto extends BaseListResponseDto<PaymentResponseDto> {}


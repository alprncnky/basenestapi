import { BaseListResponseDto } from '../../../common/base/base-dto';
import { AutoListResponse } from '../../../common/decorators/auto-response.decorator';
import { PaymentResponseDto } from './payment-response.dto';

/**
 * Response DTO for payment list
 * Swagger documentation is automatically configured via @AutoListResponse
 */
@AutoListResponse(PaymentResponseDto)
export class PaymentListResponseDto extends BaseListResponseDto<PaymentResponseDto> {}


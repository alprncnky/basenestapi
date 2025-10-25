import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';

/**
 * DTO for updating an existing payment
 * Validation rules are defined in common/config/field-mappings.ts
 */
@AutoApplyDecorators('UpdatePaymentDto')
export class UpdatePaymentDto extends BaseUpdateDto {
  amount?: number;
  currency?: string;
  status?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
}


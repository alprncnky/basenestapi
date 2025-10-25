import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { UpdatePaymentMapping } from './mapping';

/**
 * DTO for updating an existing payment
 * Validation rules are defined in dto/mapping.ts
 */
@AutoApplyDecorators(UpdatePaymentMapping)
export class UpdatePaymentDto extends BaseUpdateDto {
  amount?: number;
  currency?: string;
  status?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
}


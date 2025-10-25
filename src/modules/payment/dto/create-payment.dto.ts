import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';

/**
 * DTO for creating a new payment
 * Validation rules are defined in common/config/field-mappings.ts
 */
@AutoApplyDecorators('CreatePaymentDto')
export class CreatePaymentDto extends BaseCreateDto {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}


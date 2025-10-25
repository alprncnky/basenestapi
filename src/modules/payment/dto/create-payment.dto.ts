import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { CreatePaymentMapping } from './mapping';

/**
 * DTO for creating a new payment
 * Validation rules are defined in dto/mapping.ts
 */
@AutoApplyDecorators(CreatePaymentMapping)
export class CreatePaymentDto extends BaseCreateDto {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}


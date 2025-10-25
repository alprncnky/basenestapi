import { StringField, NumberField, EmailField, BooleanField, EnumField } from '../decorators/field.decorator';

/**
 * Centralized field mappings for @AutoApplyDecorators
 * Add your DTO field configurations here
 */
export const FIELD_MAPPINGS: Record<string, Record<string, () => PropertyDecorator>> = {
  // Payment DTOs
  CreatePaymentDto: {
    amount: () => NumberField('Payment amount', 99.99, true, 0.01),
    currency: () => StringField('Payment currency', 'USD', true, 3, 3),
    customerEmail: () => EmailField('Customer email address', 'customer@example.com', true),
    customerName: () => StringField('Customer full name', 'John Doe', true),
    description: () => StringField('Payment description', 'Payment for order #1234', false),
  },

  UpdatePaymentDto: {
    amount: () => NumberField('Payment amount', 99.99, false, 0.01),
    currency: () => StringField('Payment currency', 'USD', false, 3, 3),
    status: () => StringField('Payment status', 'completed', false),
    customerEmail: () => EmailField('Customer email address', 'customer@example.com', false),
    customerName: () => StringField('Customer full name', 'John Doe', false),
    description: () => StringField('Payment description', 'Payment for order #1234', false),
  },
};


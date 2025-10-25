# Modular Architecture - Per-Module Mappings

## Overview

The architecture has been refactored to use **per-module mappings** instead of centralized configuration. This provides better modularity, type safety, and clearer dependencies.

## What Changed

### Before: Centralized Approach ❌
```typescript
// DTOs referenced string names
@AutoApplyDecorators('CreateUserDto')
@AutoResponse('UserResponseDto')

// All configurations in centralized files
common/config/field-mappings.ts    // All DTO validations
common/config/response-mappings.ts // All response docs
```

**Problems:**
- ❌ String-based references (no type safety)
- ❌ Tight coupling to centralized files
- ❌ Hard to refactor (no IDE support for renames)
- ❌ Module dependencies hidden

### After: Modular Approach ✅
```typescript
// DTOs reference mapping objects directly
@AutoApplyDecorators(CreateUserMapping)
@AutoResponse(UserResponseMapping)

// Each module owns its configuration
modules/users/dto/mapping.ts           // User DTO validations
modules/users/responses/mapping.ts     // User response docs
modules/payment/dto/mapping.ts         // Payment DTO validations  
modules/payment/responses/mapping.ts   // Payment response docs
```

**Benefits:**
- ✅ Type-safe (pass objects, not strings)
- ✅ Modular (each module owns its config)
- ✅ Easy to refactor (IDE finds all references)
- ✅ Clear dependencies (imports show relationships)
- ✅ Better for code splitting and lazy loading

## Module Structure

```
modules/
└── payment/
    ├── dto/
    │   ├── mapping.ts           # ← Field validation mappings
    │   ├── create-payment.dto.ts
    │   └── update-payment.dto.ts
    ├── entities/
    │   └── payment.entity.ts
    ├── responses/
    │   ├── mapping.ts           # ← Response documentation mappings
    │   ├── payment-response.dto.ts
    │   └── payment-list-response.dto.ts
    ├── payment.controller.ts
    ├── payment.service.ts
    └── payment.module.ts
```

## Implementation Examples

### 1. Field Mappings (DTO Validation)

**File:** `modules/payment/dto/mapping.ts`
```typescript
import { StringField, NumberField, EmailField } from '../../../common/decorators/field.decorator';

export const CreatePaymentMapping = {
  amount: () => NumberField('Payment amount', 99.99, true, 0.01),
  currency: () => StringField('Payment currency', 'USD', true, 3, 3),
  customerEmail: () => EmailField('Customer email address', 'customer@example.com', true),
  customerName: () => StringField('Customer full name', 'John Doe', true),
  description: () => StringField('Payment description', 'Payment for order #1234', false),
};

export const UpdatePaymentMapping = {
  amount: () => NumberField('Payment amount', 99.99, false, 0.01),
  currency: () => StringField('Payment currency', 'USD', false, 3, 3),
  status: () => StringField('Payment status', 'completed', false),
  customerEmail: () => EmailField('Customer email address', 'customer@example.com', false),
  customerName: () => StringField('Customer full name', 'John Doe', false),
  description: () => StringField('Payment description', 'Payment for order #1234', false),
};
```

**Usage in DTO:**
```typescript
import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';
import { CreatePaymentMapping } from './mapping';

@AutoApplyDecorators(CreatePaymentMapping)  // ← Pass object directly!
export class CreatePaymentDto extends BaseCreateDto {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}
```

### 2. Response Mappings (Swagger Documentation)

**File:** `modules/payment/responses/mapping.ts`
```typescript
import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';

export const PaymentResponseMapping: Record<string, ResponseFieldConfig> = {
  amount: { description: 'Payment amount', example: 99.99, required: true },
  currency: { description: 'Payment currency', example: 'USD', required: true },
  status: { description: 'Payment status', example: 'completed', required: true },
  customerEmail: { description: 'Customer email', example: 'customer@example.com', required: true },
  customerName: { description: 'Customer name', example: 'John Doe', required: true },
  description: { description: 'Payment description', example: 'Payment for order #1234', required: false },
  transactionId: { description: 'Transaction ID', example: 'txn_1234567890', required: false },
};
```

**Usage in Response DTO:**
```typescript
import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';
import { PaymentResponseMapping } from './mapping';

@AutoResponse(PaymentResponseMapping)  // ← Pass object directly!
export class PaymentResponseDto extends BaseResponseDto {
  amount: number;
  currency: string;
  status: PaymentStatus;
  customerEmail: string;
  customerName: string;
  description?: string;
  transactionId?: string;
}
```

## Decorator Updates

### @AutoApplyDecorators
**Before:**
```typescript
@AutoApplyDecorators('CreateUserDto')  // String reference
```

**After:**
```typescript
@AutoApplyDecorators(CreateUserMapping)  // Object reference (type-safe!)
```

### @AutoResponse
**Before:**
```typescript
@AutoResponse('UserResponseDto')  // String reference
```

**After:**
```typescript
@AutoResponse(UserResponseMapping)  // Object reference (type-safe!)
```

## Migration Guide

### For New Modules

1. **Create DTO mappings** in `dto/mapping.ts`:
```typescript
export const CreateFeatureMapping = { /* ... */ };
export const UpdateFeatureMapping = { /* ... */ };
```

2. **Create response mappings** in `responses/mapping.ts`:
```typescript
export const FeatureResponseMapping: Record<string, ResponseFieldConfig> = { /* ... */ };
```

3. **Import and use** in your DTOs:
```typescript
import { CreateFeatureMapping } from './mapping';

@AutoApplyDecorators(CreateFeatureMapping)
export class CreateFeatureDto extends BaseCreateDto { /* ... */ }
```

### For Existing Modules (if any)

1. Create `dto/mapping.ts` with your field configurations
2. Create `responses/mapping.ts` with your response configurations
3. Update decorators from string to object references
4. Remove entries from centralized config files (if using legacy approach)

## Legacy Files

The following files are kept for reference but marked as deprecated:

- `common/config/field-mappings.ts` - Now empty with deprecation notice
- `common/config/response-mappings.ts` - Now empty with deprecation notice

These can be deleted once all modules are migrated (or kept for backward compatibility).

## Key Benefits Recap

| Aspect | Centralized | Modular |
|--------|-------------|---------|
| **Type Safety** | ❌ Strings | ✅ Objects |
| **Modularity** | ❌ Tight coupling | ✅ Self-contained |
| **Refactoring** | ❌ Manual search | ✅ IDE support |
| **Dependencies** | ❌ Hidden | ✅ Explicit imports |
| **Code Splitting** | ❌ Load all | ✅ Lazy load |
| **Testing** | ❌ Mock global | ✅ Mock local |
| **Team Scaling** | ❌ Conflicts | ✅ Independent |

## Example: Complete Payment Module

See the `modules/payment` directory for a complete working example following the modular architecture pattern.

## Documentation

- **`AGENTS.md`** - Updated with modular approach throughout
- **`QUICK_START.md`** - Updated with new decorator usage
- **`IMPLEMENTATION.md`** - Shows modular structure

## Date
October 25, 2025


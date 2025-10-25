/**
 * LEGACY: Centralized field mappings for @AutoApplyDecorators
 * 
 * ⚠️ DEPRECATED APPROACH - Not recommended for new modules
 * 
 * RECOMMENDED: Each module should define its own mapping in dto/mapping.ts
 * 
 * Example (in modules/[feature]/dto/mapping.ts):
 * export const CreateUserMapping = {
 *   name: () => StringField('User name', 'John Doe'),
 *   email: () => EmailField('User email', 'john@example.com'),
 * };
 * 
 * Then use: @AutoApplyDecorators(CreateUserMapping)
 * 
 * This file is kept for reference and backward compatibility only.
 */
export const FIELD_MAPPINGS: Record<string, Record<string, () => PropertyDecorator>> = {};

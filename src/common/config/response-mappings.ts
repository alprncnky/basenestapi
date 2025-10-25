import { ResponseFieldConfig } from '../decorators/auto-response.decorator';

/**
 * LEGACY: Centralized response mappings for @AutoResponse
 * 
 * ⚠️ DEPRECATED APPROACH - Not recommended for new modules
 * 
 * RECOMMENDED: Each module should define its own mapping in responses/mapping.ts
 * 
 * Example (in modules/[feature]/responses/mapping.ts):
 * export const UserResponseMapping: Record<string, ResponseFieldConfig> = {
 *   name: { description: 'User name', example: 'John Doe', required: true },
 *   email: { description: 'User email', example: 'john@example.com', required: true },
 * };
 * 
 * Then use: @AutoResponse(UserResponseMapping)
 * 
 * This file is kept for reference and backward compatibility only.
 */
export const RESPONSE_MAPPINGS: Record<string, Record<string, ResponseFieldConfig>> = {};

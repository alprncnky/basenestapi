import { FIELD_MAPPINGS } from '../config/field-mappings';

/**
 * Decorator that automatically applies field decorators from centralized configuration
 * Usage: @AutoApplyDecorators('CreateUserDto')
 * 
 * Configuration must be defined in common/config/field-mappings.ts
 */
export function AutoApplyDecorators(dtoName: string) {
  return function (target: any) {
    const fieldMappings = FIELD_MAPPINGS[dtoName];
    
    if (!fieldMappings) {
      console.warn(`No field mappings found for ${dtoName} in FIELD_MAPPINGS`);
      return target;
    }

    for (const [propertyKey, decoratorFactory] of Object.entries(fieldMappings)) {
      const decorator = decoratorFactory();
      decorator(target.prototype, propertyKey);
    }

    return target;
  };
}


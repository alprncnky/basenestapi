import { ApiProperty } from '@nestjs/swagger';

/**
 * Response field configuration interface
 */
export interface ResponseFieldConfig {
  description: string;
  example: any;
  required: boolean;
}

/**
 * Decorator that automatically applies Swagger documentation and mapping from mapping object
 * Usage: @AutoResponse(UserResponseMapping)
 * 
 * Mapping should be defined in the module's responses/mapping.ts file
 * Also adds automatic constructor for entity-to-DTO mapping
 */
export function AutoResponse(responseMappings: Record<string, ResponseFieldConfig>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    if (responseMappings) {
      // Apply Swagger decorators based on configuration
      for (const [propertyKey, config] of Object.entries(responseMappings)) {
        ApiProperty({
          description: config.description,
          example: config.example,
          required: config.required,
        })(constructor.prototype, propertyKey);
      }
    } else {
      console.warn(`No response mappings provided to @AutoResponse`);
    }

    // Return enhanced class with automatic mapping constructor
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        if (args[0] && typeof args[0] === 'object') {
          Object.assign(this, args[0]);
        }
      }
    } as T;
  };
}

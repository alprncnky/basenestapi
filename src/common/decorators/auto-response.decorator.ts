import { ApiProperty } from '@nestjs/swagger';
import { RESPONSE_MAPPINGS } from '../config/response-mappings';

/**
 * Decorator that automatically applies Swagger documentation and mapping from centralized configuration
 * Usage: @AutoResponse('UserResponseDto')
 * 
 * Configuration must be defined in common/config/response-mappings.ts
 * Also adds automatic constructor for entity-to-DTO mapping
 */
export function AutoResponse(responseName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const responseMappings = RESPONSE_MAPPINGS[responseName];
    
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
      console.warn(`No response mappings found for ${responseName} in RESPONSE_MAPPINGS`);
    }

    // Return enhanced class with automatic mapping constructor
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        if (args[0] && typeof args[0] === 'object') {
          Object.assign(this, args[0]);
        }
      }
    };
  };
}


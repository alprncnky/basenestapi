/**
 * Decorator that automatically applies field decorators from mapping object
 * Usage: @AutoApplyDecorators(CreateUserMapping)
 * 
 * Mapping should be defined in the module's dto/mapping.ts file
 */
export function AutoApplyDecorators(fieldMappings: Record<string, () => PropertyDecorator>) {
  return function (target: any) {
    if (!fieldMappings) {
      console.warn(`No field mappings provided to @AutoApplyDecorators`);
      return target;
    }

    for (const [propertyKey, decoratorFactory] of Object.entries(fieldMappings)) {
      const decorator = decoratorFactory();
      decorator(target.prototype, propertyKey);
    }

    return target;
  };
}


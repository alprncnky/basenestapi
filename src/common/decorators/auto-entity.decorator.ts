/**
 * Decorator that adds automatic property mapping to entities
 * Usage: @AutoEntity()
 * 
 * This allows creating entities like: new User({ name: 'John', email: 'john@example.com' })
 * without writing manual constructors
 */
export function AutoEntity() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const enhancedClass = class extends constructor {
      constructor(...args: any[]) {
        super();
        if (args.length > 0 && args[0] && typeof args[0] === 'object') {
          Object.assign(this, args[0]);
        }
      }
    } as T;

    // Preserve the original class name
    Object.defineProperty(enhancedClass, 'name', {
      value: constructor.name,
      writable: false,
    });

    return enhancedClass;
  };
}


/**
 * Decorator that adds automatic property mapping to entities
 * Usage: @AutoEntity()
 * 
 * This allows creating entities like: new User({ name: 'John', email: 'john@example.com' })
 * without writing manual constructors
 */
export function AutoEntity() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
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


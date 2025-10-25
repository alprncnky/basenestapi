import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Combines @Controller, @ApiTags for consistent CRUD controllers
 * Usage: @CrudController('users', 'User')
 */
export function CrudController(path: string, tag: string) {
  return applyDecorators(
    Controller(path),
    ApiTags(tag),
  );
}


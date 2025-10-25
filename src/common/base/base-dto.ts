import { ApiProperty } from '@nestjs/swagger';

/**
 * Abstract base class for all DTOs
 */
export abstract class BaseDto {}

/**
 * Base class for create DTOs
 */
export abstract class BaseCreateDto extends BaseDto {}

/**
 * Base class for update DTOs
 */
export abstract class BaseUpdateDto extends BaseDto {}

/**
 * Base response DTO with common properties
 */
export abstract class BaseResponseDto {
  @ApiProperty({ description: 'Entity ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(partial?: Partial<any>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

/**
 * Generic list response DTO
 */
export class BaseListResponseDto<T> {
  @ApiProperty({ description: 'List of items', isArray: true })
  items: T[];

  @ApiProperty({ description: 'Total count', example: 10 })
  total: number;

  constructor(items: T[], total?: number) {
    this.items = items;
    this.total = total !== undefined ? total : items.length;
  }
}


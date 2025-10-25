import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

/**
 * String field decorator with validation and Swagger documentation
 */
export function StringField(
  description: string,
  example: string,
  required: boolean = true,
  minLength?: number,
  maxLength?: number,
) {
  const decorators = [
    ApiProperty({ description, example, required }),
    IsString(),
  ];

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  if (minLength !== undefined) {
    decorators.push(MinLength(minLength));
  }

  if (maxLength !== undefined) {
    decorators.push(MaxLength(maxLength));
  }

  return applyDecorators(...decorators);
}

/**
 * Email field decorator with validation and Swagger documentation
 */
export function EmailField(
  description: string,
  example: string,
  required: boolean = true,
) {
  const decorators = [
    ApiProperty({ description, example, required }),
    IsEmail(),
  ];

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}

/**
 * Number field decorator with validation and Swagger documentation
 */
export function NumberField(
  description: string,
  example: number,
  required: boolean = true,
  min?: number,
  max?: number,
) {
  const decorators = [
    ApiProperty({ description, example, required }),
    IsNumber(),
  ];

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  if (min !== undefined) {
    decorators.push(Min(min));
  }

  if (max !== undefined) {
    decorators.push(Max(max));
  }

  return applyDecorators(...decorators);
}

/**
 * Boolean field decorator with validation and Swagger documentation
 */
export function BooleanField(
  description: string,
  example: boolean,
  required: boolean = true,
) {
  const decorators = [
    ApiProperty({ description, example, required }),
    IsBoolean(),
  ];

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}

/**
 * Enum field decorator with validation and Swagger documentation
 */
export function EnumField(
  enumType: object,
  description: string,
  example: any,
  required: boolean = true,
) {
  const decorators = [
    ApiProperty({ description, example, required, enum: enumType }),
    IsEnum(enumType),
  ];

  if (!required) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}


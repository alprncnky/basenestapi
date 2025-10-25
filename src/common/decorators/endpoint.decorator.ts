import { applyDecorators, Post, Get, Patch, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * Decorator for CREATE endpoints (POST /)
 */
export function CreateEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post(),
    ApiOperation({ summary: `Create a new ${entityName}` }),
    ApiResponse({
      status: 201,
      description: `${entityName} created successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
  );
}

/**
 * Decorator for GET ALL endpoints (GET /)
 */
export function GetAllEndpoint(entityName: string, responseType: any, queryParams?: string[]) {
  const decorators = [
    Get(),
    ApiOperation({ summary: `Get all ${entityName}s` }),
    ApiResponse({
      status: 200,
      description: `List of ${entityName}s`,
      type: responseType,
    }),
  ];

  return applyDecorators(...decorators);
}

/**
 * Decorator for GET BY ID endpoints (GET /:id)
 */
export function GetByIdEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Get(':id'),
    ApiOperation({ summary: `Get ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({
      status: 200,
      description: `${entityName} found`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for UPDATE endpoints (PATCH /:id)
 */
export function UpdateEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Patch(':id'),
    ApiOperation({ summary: `Update ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({
      status: 200,
      description: `${entityName} updated successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for DELETE endpoints (DELETE /:id)
 */
export function DeleteEndpoint(entityName: string) {
  return applyDecorators(
    Delete(':id'),
    ApiOperation({ summary: `Delete ${entityName} by ID` }),
    ApiParam({ name: 'id', type: 'number', description: `${entityName} ID` }),
    ApiResponse({ status: 200, description: `${entityName} deleted successfully` }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}

/**
 * Decorator for SAVE endpoints (POST /save) - custom business operation
 */
export function SaveEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post('save'),
    ApiOperation({ summary: `Save ${entityName} with additional business logic` }),
    ApiResponse({
      status: 201,
      description: `${entityName} saved successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
  );
}

/**
 * Decorator for REGISTER endpoints (POST /register)
 */
export function RegisterEndpoint(entityName: string, responseType: any) {
  return applyDecorators(
    Post('register'),
    ApiOperation({ summary: `Register a new ${entityName}` }),
    ApiResponse({
      status: 201,
      description: `${entityName} registered successfully`,
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
  );
}

/**
 * Decorator for GET BY FIELD endpoints (GET /field/:value)
 */
export function GetByFieldEndpoint(entityName: string, fieldName: string, responseType: any) {
  return applyDecorators(
    Get(`${fieldName}/:${fieldName}`),
    ApiOperation({ summary: `Get ${entityName} by ${fieldName}` }),
    ApiParam({ name: fieldName, type: 'string', description: `${entityName} ${fieldName}` }),
    ApiResponse({
      status: 200,
      description: `${entityName} found`,
      type: responseType,
    }),
    ApiResponse({ status: 404, description: `${entityName} not found` }),
  );
}


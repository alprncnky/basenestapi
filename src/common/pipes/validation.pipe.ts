import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Custom validation pipe with default configuration
 * Can be extended with additional validation logic if needed
 */
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }
}


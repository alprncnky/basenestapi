import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

/**
 * Payment module
 * 
 * In production with TypeORM, add:
 * imports: [TypeOrmModule.forFeature([Payment])],
 */
@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}


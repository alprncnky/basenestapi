import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import {
  CreateEndpoint,
  GetAllEndpoint,
  GetByIdEndpoint,
  UpdateEndpoint,
  DeleteEndpoint,
} from '../../common/decorators/endpoint.decorator';
import { PaymentService } from './payment.service';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './responses/payment-response.dto';
import { PaymentCreatedResponseDto } from './responses/payment-created-response.dto';
import { PaymentListResponseDto } from './responses/payment-list-response.dto';

/**
 * Payment controller - handles HTTP requests for payment operations
 * 
 * Extends BaseController for standard CRUD operations
 * Implements additional custom endpoints for payment-specific operations
 */
@CrudController('payments', 'Payment')
export class PaymentController extends BaseController<
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentCreatedResponseDto
> {
  constructor(private readonly paymentService: PaymentService) {
    super(paymentService);
  }

  /**
   * Implement abstract methods from BaseController
   */
  protected getResponseClass = () => PaymentResponseDto;
  protected getListResponseClass = () => PaymentListResponseDto;
  protected getCreatedResponseClass = () => PaymentCreatedResponseDto;
  protected getEntityName = () => 'Payment';

  /**
   * Standard CRUD endpoints using base class methods
   */

  @CreateEndpoint('Payment', PaymentCreatedResponseDto)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.createEntity(createPaymentDto);
  }

  @GetAllEndpoint('Payment', PaymentListResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus, description: 'Filter by payment status' })
  @ApiQuery({ name: 'email', required: false, type: 'string', description: 'Filter by customer email' })
  async findAll(
    @Query('status') status?: PaymentStatus,
    @Query('email') email?: string,
  ) {
    let payments: Payment[];

    if (status) {
      payments = await this.paymentService.findByStatus(status);
    } else if (email) {
      payments = await this.paymentService.findByCustomerEmail(email);
    } else {
      payments = await this.paymentService.findAll();
    }

    const responseItems = payments.map((payment) => new PaymentResponseDto(payment));
    return new PaymentListResponseDto(responseItems, payments.length);
  }

  @GetByIdEndpoint('Payment', PaymentResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOneEntity(id);
  }

  @UpdateEndpoint('Payment', PaymentResponseDto)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.updateEntity(id, updatePaymentDto);
  }

  @DeleteEndpoint('Payment')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.removeEntity(id);
  }

  /**
   * Custom business endpoints
   */

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a pending payment' })
  @ApiParam({ name: 'id', type: 'number', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment cannot be processed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async processPayment(@Param('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.processPayment(id);
    return new PaymentResponseDto(payment);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a completed payment' })
  @ApiParam({ name: 'id', type: 'number', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment cannot be refunded' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(@Param('id', ParseIntPipe) id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.refundPayment(id);
    return new PaymentResponseDto(payment);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get payments by status' })
  @ApiParam({ name: 'status', enum: PaymentStatus, description: 'Payment status' })
  @ApiResponse({
    status: 200,
    description: 'List of payments with specified status',
    type: PaymentListResponseDto,
  })
  async findByStatus(@Param('status') status: PaymentStatus): Promise<PaymentListResponseDto> {
    const payments = await this.paymentService.findByStatus(status);
    const responseItems = payments.map((payment) => new PaymentResponseDto(payment));
    return new PaymentListResponseDto(responseItems, payments.length);
  }
}


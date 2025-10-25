import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IBaseService } from '../../common/interfaces/base-service.interface';

/**
 * Payment service - handles business logic for payments
 * 
 * In production, this would integrate with a real database (TypeORM/Prisma)
 * For now, using in-memory storage for demonstration
 */
@Injectable()
export class PaymentService implements IBaseService<Payment> {
  // In-memory storage (replace with TypeORM repository in production)
  private payments: Payment[] = [];
  private idCounter = 1;

  /**
   * Create a new payment
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // 1. Validation
    await this.validatePayment(createPaymentDto);

    // 2. Generate transaction ID
    const transactionId = this.generateTransactionId();
    
    // 3. Create payment entity - @AutoEntity allows object literal
    const payment: Payment = {
      id: this.idCounter++,
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
      transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Save payment
    this.payments.push(payment);

    return payment;
  }

  /**
   * Find all payments
   */
  async findAll(): Promise<Payment[]> {
    return this.payments;
  }

  /**
   * Find one payment by ID
   */
  async findOne(id: number): Promise<Payment> {
    const payment = this.payments.find((p) => p.id === id);
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Find payments by status
   */
  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.payments.filter((p) => p.status === status);
  }

  /**
   * Find payments by customer email
   */
  async findByCustomerEmail(email: string): Promise<Payment[]> {
    return this.payments.filter((p) => p.customerEmail === email);
  }

  /**
   * Update a payment
   */
  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    // Validate status transition if status is being updated
    if (updatePaymentDto.status) {
      this.validateStatusTransition(payment.status, updatePaymentDto.status as PaymentStatus);
    }

    // Prepare update data with proper type casting
    const { status, ...otherUpdates } = updatePaymentDto;
    
    // Update payment - @AutoEntity allows object literal
    const updatedPayment: Payment = {
      ...payment,
      ...otherUpdates,
      ...(status && { status: status as PaymentStatus }),
      updatedAt: new Date(),
    };

    // Replace in array
    const index = this.payments.findIndex((p) => p.id === id);
    this.payments[index] = updatedPayment;

    return updatedPayment;
  }

  /**
   * Remove a payment
   */
  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    
    // Business rule: cannot delete completed or refunded payments
    if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException(`Cannot delete ${payment.status} payments`);
    }

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments.splice(index, 1);
  }

  /**
   * Process payment (custom business operation)
   */
  async processPayment(id: number): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment with ID ${id} is not in pending status`);
    }

    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate

    const updatedPayment: Payment = {
      ...payment,
      status: success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      updatedAt: new Date(),
    };

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments[index] = updatedPayment;

    return updatedPayment;
  }

  /**
   * Refund a payment (custom business operation)
   */
  async refundPayment(id: number): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Can only refund completed payments`);
    }

    const updatedPayment: Payment = {
      ...payment,
      status: PaymentStatus.REFUNDED,
      updatedAt: new Date(),
    };

    const index = this.payments.findIndex((p) => p.id === id);
    this.payments[index] = updatedPayment;

    return updatedPayment;
  }

  /**
   * Private validation methods
   */
  private async validatePayment(dto: CreatePaymentDto): Promise<void> {
    // Validate amount
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(dto.currency.toUpperCase())) {
      throw new BadRequestException(`Invalid currency. Supported: ${validCurrencies.join(', ')}`);
    }
  }

  private validateStatusTransition(currentStatus: PaymentStatus, newStatus: PaymentStatus): void {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [],
      [PaymentStatus.REFUNDED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


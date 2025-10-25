import { IBaseService } from '../interfaces/base-service.interface';
import { BaseListResponseDto } from './base-dto';

/**
 * Abstract base controller providing standard CRUD operations
 * 
 * Type parameters:
 * - T1: Entity type
 * - T2: Create DTO type
 * - T3: Update DTO type
 * - T4: Single response DTO type
 * - T5: List response DTO type
 * - T6: Created response DTO type
 */
export abstract class BaseController<T1, T2, T3, T4, T5, T6> {
  constructor(protected readonly service: IBaseService<T1>) {}

  /**
   * Abstract methods that must be implemented by child controllers
   */
  protected abstract getResponseClass(): new (data: T1) => T4;
  protected abstract getListResponseClass(): new (items: T4[], total: number) => T5;
  protected abstract getCreatedResponseClass(): new (data: T1) => T6;
  protected abstract getEntityName(): string;

  /**
   * Create entity
   */
  protected async createEntity(createDto: T2): Promise<T6> {
    const entity = await this.service.create(createDto);
    const ResponseClass = this.getCreatedResponseClass();
    return new ResponseClass(entity);
  }

  /**
   * Find all entities
   */
  protected async findAllEntities(): Promise<T5> {
    const entities = await this.service.findAll();
    const ResponseClass = this.getResponseClass();
    const ListResponseClass = this.getListResponseClass();
    
    const responseItems = entities.map((entity) => new ResponseClass(entity));
    return new ListResponseClass(responseItems, entities.length);
  }

  /**
   * Find one entity by ID
   */
  protected async findOneEntity(id: number): Promise<T4> {
    const entity = await this.service.findOne(id);
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  /**
   * Update entity by ID
   */
  protected async updateEntity(id: number, updateDto: T3): Promise<T4> {
    const entity = await this.service.update(id, updateDto);
    const ResponseClass = this.getResponseClass();
    return new ResponseClass(entity);
  }

  /**
   * Remove entity by ID
   */
  protected async removeEntity(id: number): Promise<{ message: string }> {
    await this.service.remove(id);
    return { message: `${this.getEntityName()} with ID ${id} deleted successfully` };
  }
}


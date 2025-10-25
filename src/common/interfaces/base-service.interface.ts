/**
 * Base service interface for standard CRUD operations
 */
export interface IBaseService<T> {
  create(createDto: any): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: number): Promise<T>;
  update(id: number, updateDto: any): Promise<T>;
  remove(id: number): Promise<void>;
}


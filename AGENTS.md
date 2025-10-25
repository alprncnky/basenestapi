# PROJECT GUIDELINES - Clean Architecture NestJS API

## Architecture Overview

**3-Layer Clean Architecture** with Repository Pattern:
- **Controller Layer**: API endpoints and request handling
- **Business Layer**: Service logic and business rules
- **Data Layer**: TypeORM/Prisma repositories and data access

## Core Philosophy

**Write business logic, NOT boilerplate.** 

Use three powerful decorators to eliminate all repetitive code:
- `@AutoEntity()` - Entities with zero boilerplate
- `@AutoApplyDecorators('DtoName')` - Input DTOs with automatic validation
- `@AutoResponse('ResponseName')` - Response DTOs with automatic mapping + Swagger

## Quick Start: The Decorator-First Approach

This is the **SIMPLEST** way to build your API. Just define properties and add decorators:

```typescript
// 1️⃣ Entity - No constructor needed!
@AutoEntity()
export class User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2️⃣ Input DTO - Validation from config
@AutoApplyDecorators('CreateUserDto')
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}

// 3️⃣ Response DTO - Auto-mapping + Swagger
@AutoResponse('UserResponseDto')
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
}

// 4️⃣ Configuration (centralized)
// In common/config/field-mappings.ts
export const FIELD_MAPPINGS = {
  CreateUserDto: {
    name: () => StringField('User name', 'John Doe'),
    email: () => EmailField('User email', 'john@example.com'),
  }
};

// In common/config/response-mappings.ts
export const RESPONSE_MAPPINGS = {
  UserResponseDto: {
    name: { description: 'User name', example: 'John Doe', required: true },
    email: { description: 'User email', example: 'john@example.com', required: true },
  }
};

// 5️⃣ Service - Focus on business logic
@Injectable()
export class UsersService {
  async create(dto: CreateUserDto): Promise<User> {
    await this.validateUser(dto);
    
    // @AutoEntity makes this simple!
    const user = new User({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return await this.usersRepository.save(user);
  }
}

// 6️⃣ Controller - Automatic CRUD
@CrudController('users', 'User')
export class UsersController extends BaseController<...> {
  @CreateEndpoint('User', UserResponseDto)
  create(@Body() createDto: CreateUserDto) {
    return this.createEntity(createDto);
  }
}
```

**Result**: Full CRUD API with validation, error handling, Swagger docs, and type safety - all automatic!

## Core Principles

### 1. Ultra-Simple Pattern with Decorators (PRIMARY APPROACH)

**Goal**: Define ONLY business-relevant properties. All mapping, validation, and documentation handled automatically.

#### Entities with `@AutoEntity`

```typescript
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class User {
  id: number;
  name: string;
  email: string;
  age?: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Usage - automatic mapping! No constructor needed!
const user = new User({ id: 1, name: 'John', email: 'john@example.com', role: 'user' });
```

**Benefits:**
- ✅ No manual constructor code
- ✅ Automatic property mapping from any object
- ✅ Type-safe property access
- ✅ Clean, readable entity definitions

#### Input DTOs with `@AutoApplyDecorators`

```typescript
import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';

@AutoApplyDecorators('CreateUserDto')
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
  age?: number;
  role?: string;
}

// Configuration in common/config/field-mappings.ts
export const FIELD_MAPPINGS = {
  CreateUserDto: {
    name: () => StringField('User full name', 'John Doe'),
    email: () => EmailField('User email address', 'john@example.com'),
    age: () => NumberField('User age', 25, false, 18, 100),
    role: () => StringField('User role', 'user', false),
  }
};
```

**Benefits:**
- ✅ Properties defined once
- ✅ Validation rules centralized in config
- ✅ Automatic Swagger documentation
- ✅ Type-safe and DRY

#### Response DTOs with `@AutoResponse`

```typescript
import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';

@AutoResponse('UserResponseDto')
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  age?: number;
  role: string;
}

// Configuration in common/config/response-mappings.ts
export const RESPONSE_MAPPINGS = {
  UserResponseDto: {
    name: { description: 'User full name', example: 'John Doe', required: true },
    email: { description: 'User email', example: 'john@example.com', required: true },
    age: { description: 'User age', example: 25, required: false },
    role: { description: 'User role', example: 'user', required: true },
  }
};

// Usage - automatic mapping! No constructor needed!
const user = await this.usersService.findOne(id);
return new UserResponseDto(user);  // Auto-maps all fields from entity!
```

**Benefits:**
- ✅ No manual mapping code
- ✅ Automatic entity-to-DTO transformation
- ✅ Centralized Swagger documentation
- ✅ Consistent API responses

### 2. Base Classes & Inheritance

- **BaseDto**: Abstract model base for all DTOs
- **BaseCreateDto**: Extends BaseDto for create operations
- **BaseUpdateDto**: Extends BaseDto for update operations
- **BaseResponseDto**: Abstract response base with common properties
  - Contains `id`, `createdAt`, `updatedAt`
  - Used with `@AutoResponse` decorator for automatic mapping
- **BaseListResponseDto<T>**: Generic list response
  - Contains `items[]` and `total` count
  - Consistent pagination structure
- **BaseController<T1,T2,T3,T4,T5>**: Generic controller with full CRUD
  - Automatic CRUD endpoint generation
  - Built-in error handling and response formatting
  - Override methods only for custom business logic

### 3. Generic Base Controller Pattern

```typescript
@CrudController('users', 'User')
export class UsersController extends BaseController<
  User,                    // T1: Entity
  CreateUserDto,          // T2: Create DTO
  UpdateUserDto,          // T3: Update DTO
  UserResponseDto,        // T4: Single Response
  UserListResponseDto     // T5: List Response
> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
  
  // Implement abstract methods
  protected getResponseClass = () => UserResponseDto;
  protected getListResponseClass = () => UserListResponseDto;
  protected getEntityName = () => 'User';
  
  // Override only when custom business logic needed
  @GetByIdEndpoint('User', UserResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneWithCustomLogic(id);
    return new UserResponseDto(user);  // Auto-maps with @AutoResponse!
  }
}
```

**Key Implementation Points:**
- **Base Methods Available**: createEntity, findAllEntities, findOneEntity, updateEntity, removeEntity
- **Service Injection**: Inject service via constructor for business operations
- **Method Overriding**: Override base methods when business rules differ from standard CRUD
- **Endpoint Decorators**: Use custom decorators for consistent Swagger documentation
- **Authorization**: Apply guards at controller or method level
- **Automatic Mapping**: Response DTOs with `@AutoResponse` handle entity-to-DTO transformation automatically

### 4. Service Layer Rules

**Service Implementation Pattern:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Validation first
    await this.validateUser(createUserDto);
    
    // 2. Business logic
    // @AutoEntity makes this simple - just pass the data object!
    const user = new User({
      ...createUserDto,
      role: createUserDto.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 3. Repository operation
    return await this.usersRepository.save(user);
  }
  
  async saveUser(saveUserDto: SaveUserDto): Promise<User> {
    await this.validateUserForSave(saveUserDto);
    await this.checkExternalServices(saveUserDto);
    const user = await this.create(saveUserDto);
    await this.postSaveOperations(user);
    return user;
  }
  
  private async validateUser(dto: CreateUserDto): Promise<void> {
    // Business validation logic
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: dto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }
  
  private async validateUserForSave(dto: SaveUserDto): Promise<void> {
    // Complex business validation logic
  }
  
  private async checkExternalServices(dto: SaveUserDto): Promise<void> {
    // External API calls, integrations, etc.
  }
  
  private async postSaveOperations(user: User): Promise<void> {
    // Post-save actions like sending emails, logging, etc.
  }
}
```

**Service Layer Principles:**
- **Validation First**: All business rules validation before data operations
- **Error Handling**: Throw NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.)
- **Separation**: Keep data access via repository/TypeORM, business logic in services
- **Async Pattern**: All service methods async for scalability
- **Private Methods**: Extract complex validation/logic to private methods
- **Return Types**: Always return domain entities (decorated with `@AutoEntity`), not DTOs
- **Entity Creation**: Use `new Entity({ ...data })` - `@AutoEntity` handles the mapping automatically

### 5. Global Middleware & Interceptors

**Response Interceptor** (`main.ts`):
```typescript
app.useGlobalInterceptors(new ResponseInterceptor());

// All responses wrapped:
{
  "data": { /* actual response */ },
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Exception Filter** (`main.ts`):
```typescript
app.useGlobalFilters(new HttpExceptionFilter());

// Error responses formatted:
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users/999",
  "message": "User with ID 999 not found"
}
```

**Validation Pipe** (`main.ts`):
```typescript
app.useGlobalPipes(new ValidationPipe());

// Automatic DTO validation before controller methods
// Validation errors return structured response with field-level details
```

**Available Exceptions:**
- `NotFoundException` (404)
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `ConflictException` (409)
- `InternalServerErrorException` (500)

### 6. Custom Decorators

**Controller Decorators:**
```typescript
// Standard CRUD endpoints
@CreateEndpoint(entityName, responseType)    // POST /
@GetAllEndpoint(entityName, responseType)    // GET /
@GetByIdEndpoint(entityName, responseType)   // GET /:id
@UpdateEndpoint(entityName, responseType)    // PATCH /:id
@DeleteEndpoint(entityName)                  // DELETE /:id

// Custom business endpoints
@SaveEndpoint(entityName, responseType)      // POST /save
@RegisterEndpoint(entityName, responseType)  // POST /register
@GetByFieldEndpoint(entityName, 'email', responseType)  // GET /email/:email
```

**CrudController Decorator:**
```typescript
@CrudController('users', 'User')
export class UsersController extends BaseController<...> { }

// Combines: @Controller('users') + @ApiTags('users') + Swagger metadata
```

### 7. Dependency Injection

**Module Structure:**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Import entities
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Export for use in other modules
})
export class UsersModule {}
```

**Service Injection:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}
}
```

**Controller Injection:**
```typescript
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
}
```

**DI Principles:**
- Use `@Injectable()` decorator on services
- Constructor injection with `private readonly` pattern
- No manual instantiation - let NestJS DI container handle it
- Similar to .NET's built-in DI container

### 8. OpenAPI / Swagger Integration

**Configuration** (`main.ts`):
```typescript
const config = new DocumentBuilder()
  .setTitle('API Title')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addTag('users', 'User management endpoints')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Access**: `http://localhost:3000/api/docs`

**Automatic Documentation:**
- Field decorators include Swagger metadata
- Controller decorators include operation descriptions
- Response DTOs define response schemas
- Centralized configuration in `field-mappings.ts` and `response-mappings.ts`

### 9. Entity & Repository Pattern

**Entity Definition (RECOMMENDED - with @AutoEntity):**
```typescript
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

// Simple, clean entity with automatic mapping
@AutoEntity()
export class User {
  id: number;
  name: string;
  email: string;
  age?: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Usage - no manual constructor needed!
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

**For Production with TypeORM (combine @AutoEntity with TypeORM decorators):**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

@Entity('users')
@AutoEntity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'varchar', length: 255 })
  name: string;
  
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
  
  @Column({ type: 'int', nullable: true })
  age?: number;
  
  @Column({ type: 'varchar', default: 'user' })
  role: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}

// Benefits: TypeORM database mapping + automatic object mapping!
```

**Repository Usage:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }
  
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  
  async findByRole(role: string): Promise<User[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role })
      .getMany();
  }
  
  async create(data: Partial<User>): Promise<User> {
    // @AutoEntity makes this simple
    const user = new User({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.usersRepository.save(user);
  }
}
```

### 10. Layer Responsibilities

**Controller Layer:**
- **Do**: Route definition, request validation, delegate to service, return formatted responses
- **Don't**: Contain business logic, access data layer directly, handle complex transformations

**Service Layer:**
- **Do**: Implement business rules, orchestrate operations, handle transactions, interact with external services
- **Don't**: Handle HTTP concerns, return DTOs (return entities), contain data access logic

**Data Layer:**
- **Do**: Data persistence operations, query building, entity transformations
- **Don't**: Contain business logic, handle HTTP requests, format responses

## Project Structure

```
src/
├── common/                          # Shared infrastructure
│   ├── base/                        # Base classes (controllers, DTOs)
│   ├── decorators/                  # Custom decorators (field, controller, swagger)
│   ├── filters/                     # Exception filters
│   ├── interceptors/                # Response/logging interceptors
│   ├── pipes/                       # Validation pipes
│   ├── config/                      # Configuration mappings
│   └── interfaces/                  # Shared interfaces
│
├── modules/                         # Feature modules
│   ├── users/
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── entities/                # Domain entities
│   │   ├── responses/               # Response DTOs
│   │   ├── users.controller.ts      # API endpoints
│   │   ├── users.service.ts         # Business logic
│   │   └── users.module.ts          # Module definition
│   │
│   └── products/                    # Similar structure
│
├── config/                          # Application configuration
├── database/                        # Database migrations & seeds
│
├── app.module.ts                    # Root module
└── main.ts                          # Application bootstrap
```

## Development Checklist

### When Adding New Feature (Ultra-Simple Pattern):

#### Step 1: Create Entity
**File:** `modules/[feature]/entities/[feature].entity.ts`
```typescript
import { AutoEntity } from '../../../common/decorators/auto-entity.decorator';

@AutoEntity()
export class Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**That's it! No constructor needed.**

#### Step 2: Create Input DTOs
**File:** `modules/[feature]/dto/create-[feature].dto.ts`
```typescript
import { BaseCreateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';

@AutoApplyDecorators('CreateProductDto')
export class CreateProductDto extends BaseCreateDto {
  name: string;
  description?: string;
  price: number;
  category: string;
}
```

**File:** `modules/[feature]/dto/update-[feature].dto.ts`
```typescript
import { BaseUpdateDto } from '../../../common/base/base-dto';
import { AutoApplyDecorators } from '../../../common/decorators/auto-apply.decorator';

@AutoApplyDecorators('UpdateProductDto')
export class UpdateProductDto extends BaseUpdateDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
}
```

#### Step 3: Create Response DTOs
**File:** `modules/[feature]/responses/[feature]-response.dto.ts`
```typescript
import { BaseResponseDto } from '../../../common/base/base-dto';
import { AutoResponse } from '../../../common/decorators/auto-response.decorator';

@AutoResponse('ProductResponseDto')
export class ProductResponseDto extends BaseResponseDto {
  name: string;
  description?: string;
  price: number;
  category: string;
}
```

**File:** `modules/[feature]/responses/[feature]-list-response.dto.ts`
```typescript
import { BaseListResponseDto } from '../../../common/base/base-dto';
import { ProductResponseDto } from './product-response.dto';

/**
 * Response DTO for product list
 * Simply extends BaseListResponseDto - no constructor needed!
 */
export class ProductListResponseDto extends BaseListResponseDto<ProductResponseDto> {}
```

**That's it! No constructor boilerplate needed.**

#### Step 4: Add Configuration Mappings
**File:** `common/config/field-mappings.ts`
```typescript
export const FIELD_MAPPINGS = {
  // ... existing mappings
  
  CreateProductDto: {
    name: () => StringField('Product name', 'Laptop', true),
    description: () => StringField('Product description', 'High-performance laptop', false),
    price: () => NumberField('Product price', 999.99, true, 0.01),
    category: () => StringField('Product category', 'Electronics', true),
  },
  
  UpdateProductDto: {
    name: () => StringField('Product name', 'Laptop', false),
    description: () => StringField('Product description', 'High-performance laptop', false),
    price: () => NumberField('Product price', 999.99, false, 0.01),
    category: () => StringField('Product category', 'Electronics', false),
  },
};
```

**File:** `common/config/response-mappings.ts`
```typescript
export const RESPONSE_MAPPINGS = {
  // ... existing mappings
  
  ProductResponseDto: {
    name: { description: 'Product name', example: 'Laptop', required: true },
    description: { description: 'Product description', example: 'High-performance laptop', required: false },
    price: { description: 'Product price', example: 999.99, required: true },
    category: { description: 'Product category', example: 'Electronics', required: true },
  },
};
```

#### Step 5: Create Service
**File:** `modules/[feature]/[feature].service.ts`
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}
  
  async create(dto: CreateProductDto): Promise<Product> {
    // 1. Validation
    await this.validateProduct(dto);
    
    // 2. Business logic - @AutoEntity handles mapping!
    const product = new Product({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 3. Save
    return await this.productsRepository.save(product);
  }
  
  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find();
  }
  
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
  
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    // @AutoEntity handles mapping
    const updated = new Product({
      ...product,
      ...dto,
      updatedAt: new Date(),
    });
    
    return await this.productsRepository.save(updated);
  }
  
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
  
  private async validateProduct(dto: CreateProductDto): Promise<void> {
    if (dto.price <= 0) {
      throw new BadRequestException('Price must be positive');
    }
    // Add more business validation as needed
  }
}
```

#### Step 6: Create Controller
**File:** `modules/[feature]/[feature].controller.ts`
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../common/decorators/crud-controller.decorator';
import { BaseController } from '../../common/base/base-controller';
import { CreateEndpoint, GetAllEndpoint, GetByIdEndpoint, UpdateEndpoint, DeleteEndpoint } from '../../common/decorators/endpoint.decorator';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './responses/product-response.dto';
import { ProductListResponseDto } from './responses/product-list-response.dto';

@CrudController('products', 'Product')
export class ProductsController extends BaseController<
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductListResponseDto
> {
  constructor(private readonly productsService: ProductsService) {
    super(productsService);
  }
  
  // Implement abstract methods
  protected getResponseClass = () => ProductResponseDto;
  protected getListResponseClass = () => ProductListResponseDto;
  protected getEntityName = () => 'Product';
  
  // Standard CRUD endpoints using base class methods
  @CreateEndpoint('Product', ProductResponseDto)
  create(@Body() createDto: CreateProductDto) {
    return this.createEntity(createDto);
  }
  
  @GetAllEndpoint('Product', ProductListResponseDto)
  findAll() {
    return this.findAllEntities();
  }
  
  @GetByIdEndpoint('Product', ProductResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOneEntity(id);
  }
  
  @UpdateEndpoint('Product', ProductResponseDto)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateProductDto) {
    return this.updateEntity(id, updateDto);
  }
  
  @DeleteEndpoint('Product')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.removeEntity(id);
  }
}
```

#### Step 7: Create Module
**File:** `modules/[feature]/[feature].module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

#### Step 8: Register Module
**File:** `app.module.ts`
```typescript
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    // ... other imports
    ProductsModule,
  ],
})
export class AppModule {}
```

#### Step 9: Test
1. Run the app: `npm run start:dev`
2. Open Swagger: `http://localhost:3000/api/docs`
3. Test all CRUD endpoints

### Summary: What You Wrote vs What You Got

**You wrote:**
- Entity: Just properties + `@AutoEntity()` decorator
- DTOs: Just properties + `@AutoApplyDecorators()` decorator
- Response: Just properties + `@AutoResponse()` decorator
- List Response: Empty class extending `BaseListResponseDto<T>` (no constructor!)
- Configuration: Simple mapping objects
- Service: Business logic only
- Controller: Endpoint definitions using base class

**You got automatically:**
- ✅ Full constructor mapping for entities
- ✅ Validation decorators on all DTO fields
- ✅ Swagger documentation for all endpoints
- ✅ Entity-to-DTO transformation
- ✅ Error handling and response formatting
- ✅ Type safety throughout

### Code Quality Standards:

**Performance & Scalability:**
- **Async/Await**: All repository and service methods must be async
- **Query Optimization**: Use QueryBuilder for complex queries, avoid N+1 problems
- **Pagination**: Implement pagination for list operations
- **Indexing**: Add database indexes for commonly queried fields

**Validation & Error Handling:**
- **Validation First**: Validate all inputs before any business logic
- **Structured Errors**: Use NestJS built-in exceptions with descriptive messages
- **Business Rules**: Implement domain validation in service layer
- **Error Codes**: Consider adding error codes for client handling

**Security & Authorization:**
- **Guards**: Apply auth guards at controller or method level
- **Input Sanitization**: Validate and sanitize all user inputs
- **CORS**: Configure CORS appropriately for production

**Code Organization:**
- **Separation of Concerns**: Controllers handle HTTP, Services handle business, Repositories handle data
- **Single Responsibility**: Each class/method should have one clear purpose
- **DRY Principle**: Use base classes and utilities to avoid repetition
- **Consistent Naming**: Follow established naming conventions
- **Type Safety**: Leverage TypeScript for compile-time checking

## Best Practices

### DO: ✅

**Use Decorators for Everything:**
✅ Use `@AutoEntity()` on all entities - no manual constructors  
✅ Use `@AutoApplyDecorators()` or `@AutoResponse()` for all DTOs  
✅ List response DTOs: Just extend `BaseListResponseDto<T>` - empty class, no constructor!  
✅ Define configuration once in `field-mappings.ts` and `response-mappings.ts`  

**Architecture Patterns:**
✅ Extend BaseController for standard CRUD operations  
✅ Keep controllers thin - only route definitions and delegations  
✅ Keep services focused on business logic and validation  
✅ Return entities from services, transform to DTOs in controllers  
✅ Use constructor injection with `private readonly` pattern  

**Code Quality:**
✅ Use TypeScript generics for type safety  
✅ Leverage global pipes, filters, and interceptors  
✅ Group related functionality in modules  
✅ Throw NestJS built-in exceptions (NotFoundException, BadRequestException, etc.)  
✅ Validate business rules in service layer private methods  
✅ Use async/await for all database operations  

**Documentation:**
✅ Centralize Swagger docs in config files  
✅ Use descriptive error messages  
✅ Add JSDoc comments for complex business logic  

### DON'T: ❌

**Anti-Patterns:**
❌ Write manual constructors with property mapping (use `@AutoEntity` instead)  
❌ Repeat validation decorators on every field (use `@AutoApplyDecorators` instead)  
❌ Write manual entity-to-DTO mapping logic (use `@AutoResponse` instead)  
❌ Implement business logic in controllers  
❌ Return raw entities without response DTOs  
❌ Duplicate CRUD code across controllers  

**Code Smells:**
❌ Catch exceptions without rethrowing or logging  
❌ Use `any` type excessively (defeats TypeScript benefits)  
❌ Mix concerns between layers  
❌ Ignore TypeScript type errors  
❌ Create tight coupling between modules  
❌ Access repositories directly from controllers  

**Common Mistakes:**
❌ Skip validation in service layer  
❌ Put business logic in DTOs or entities  
❌ Hard-code values instead of using environment variables  
❌ Forget to handle edge cases and null/undefined values  

### Code Review Checklist:

When reviewing or writing code, verify:

1. **Entities**: Do they use `@AutoEntity()` decorator?
2. **DTOs**: Do they use `@AutoApplyDecorators()` or field decorators?
3. **Responses**: Do they use `@AutoResponse()` decorator?
4. **Configuration**: Are field/response mappings defined in config files?
5. **Services**: Is validation done before business logic?
6. **Controllers**: Are they thin with no business logic?
7. **Error Handling**: Are proper NestJS exceptions thrown?
8. **Type Safety**: Is everything properly typed (no `any`)?
9. **Separation**: Are layers properly separated?
10. **Documentation**: Is Swagger documentation complete?  

## Comparison: .NET ↔ NestJS

| .NET Concept | NestJS Equivalent |
|-------------|-------------------|
| `Controller` | `@Controller()` decorator |
| `[HttpGet]`, `[HttpPost]` | `@Get()`, `@Post()` decorators |
| `IActionResult` | Auto-wrapped by ResponseInterceptor |
| `[FromBody]`, `[FromRoute]` | `@Body()`, `@Param()`, `@Query()` |
| `IService` interface | `@Injectable()` class |
| Dependency Injection | Constructor injection with DI container |
| `[ApiController]` validation | `ValidationPipe` + `class-validator` |
| AutoMapper | Constructor mapping in DTOs |
| Entity Framework | TypeORM or Prisma |
| Repository Pattern | TypeORM Repository |
| Exception Filters | `@Catch()` exception filters |
| Middleware | `@Injectable()` middleware / interceptors |
| Swagger/OpenAPI | `@nestjs/swagger` package |
| `appsettings.json` | Environment variables + ConfigService |

## Quick Reference

### The Three Magic Decorators (Use These!)

```typescript
// 1. Entities - No constructor needed!
@AutoEntity()
export class User {
  id: number;
  name: string;
  email: string;
}

// 2. Input DTOs - Validation from config
@AutoApplyDecorators('CreateUserDto')
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}

// 3. Response DTOs - Auto-mapping + Swagger
@AutoResponse('UserResponseDto')
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
}

// 4. List Response DTOs - Empty class, no constructor!
export class UserListResponseDto extends BaseListResponseDto<UserResponseDto> {}
```

### Alternative: Inline Field Decorators

If you prefer inline decorators over centralized config:

```typescript
import { StringField, EmailField, NumberField } from '../../../common/decorators/field.decorator';

export class CreateUserDto extends BaseCreateDto {
  @StringField('User full name', 'John Doe')
  name: string;
  
  @EmailField('User email address', 'john.doe@example.com')
  email: string;
  
  @NumberField('User age', 25, false, 18, 100)
  age?: number;
}

// Available field decorators:
// - @StringField(description, example, required?, minLength?, maxLength?)
// - @EmailField(description, example, required?)
// - @NumberField(description, example, required?, min?, max?)
// - @EnumField(enum, description, example, required?)
// - @BooleanField(description, example, required?)
```

**Choose your style:**
- **Centralized config** (`@AutoApplyDecorators`) - Better for large projects, easier to maintain
- **Inline decorators** - Quick for small projects, no config file needed

### NestJS CLI Commands

```bash
nest g module modules/feature
nest g controller modules/feature --no-spec
nest g service modules/feature --no-spec
nest g resource modules/feature  # All at once
```

### Run Commands

```bash
npm run start:dev        # Development with hot-reload
npm run build            # Production build
npm run start:prod       # Production run
npm run test             # Run tests
```

### Key Decorators Reference

**Entity & DTO Decorators:**
- `@AutoEntity()` - Automatic constructor mapping for entities
- `@AutoApplyDecorators('DtoName')` - Apply validation from centralized config
- `@AutoResponse('ResponseName')` - Auto-mapping + Swagger from config

**Controller Decorators:**
- `@CrudController('path', 'EntityName')` - Controller with API tags + routes
- `@CreateEndpoint(entityName, responseType)` - POST / endpoint
- `@GetAllEndpoint(entityName, responseType)` - GET / endpoint
- `@GetByIdEndpoint(entityName, responseType)` - GET /:id endpoint
- `@UpdateEndpoint(entityName, responseType)` - PATCH /:id endpoint
- `@DeleteEndpoint(entityName)` - DELETE /:id endpoint

**Custom Business Endpoints:**
- `@SaveEndpoint(entityName, responseType)` - POST /save endpoint
- `@RegisterEndpoint(entityName, responseType)` - POST /register endpoint
- `@GetByFieldEndpoint(entityName, 'fieldName', responseType)` - GET /fieldName/:value

### Global Setup (`main.ts`)

```typescript
app.setGlobalPrefix('api/v1');
app.useGlobalPipes(new ValidationPipe());
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalInterceptors(new ResponseInterceptor());
app.enableCors();

// Swagger setup
const config = new DocumentBuilder()
  .setTitle('Your API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Configuration Files

**Field Mappings:** `common/config/field-mappings.ts`
```typescript
export const FIELD_MAPPINGS = {
  CreateUserDto: {
    name: () => StringField('User name', 'John Doe'),
    email: () => EmailField('User email', 'john@example.com'),
  }
};
```

**Response Mappings:** `common/config/response-mappings.ts`
```typescript
export const RESPONSE_MAPPINGS = {
  UserResponseDto: {
    name: { description: 'User name', example: 'John Doe', required: true },
    email: { description: 'User email', example: 'john@example.com', required: true },
  }
};
```

## Common Patterns

### Pattern 1: Simple Entity Creation with @AutoEntity
```typescript
// Service method
async create(dto: CreateUserDto): Promise<User> {
  await this.validateUser(dto);
  
  // @AutoEntity handles all the mapping!
  const user = new User({
    ...dto,
    role: dto.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return await this.usersRepository.save(user);
}
```

### Pattern 2: Custom Business Endpoint
```typescript
// Controller
@SaveEndpoint('User', UserResponseDto)
async saveUser(@Body() saveUserDto: SaveUserDto) {
  const user = await this.usersService.saveUser(saveUserDto);
  return new UserResponseDto(user);  // @AutoResponse handles mapping!
}

// Service
async saveUser(dto: SaveUserDto): Promise<User> {
  await this.validateUserForSave(dto);
  await this.checkExternalServices(dto);
  
  const user = new User({
    ...dto,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  await this.usersRepository.save(user);
  await this.postSaveOperations(user);
  
  return user;
}
```

### Pattern 3: Query-based Filtering
```typescript
@GetAllEndpoint('User', UserListResponseDto, ['role'])
findAll(@Query('role') role?: string) {
  const users = role 
    ? await this.usersService.findByRole(role) 
    : await this.usersService.findAll();
  return new UserListResponseDto(users);  // @AutoResponse handles mapping!
}
```

### Pattern 4: Business Logic Validation
```typescript
// In service - always validate before operations
private async validateUserForSave(dto: SaveUserDto): Promise<void> {
  // Check existing records
  const existing = await this.usersRepository.findOne({ 
    where: { email: dto.email } 
  });
  if (existing) {
    throw new ConflictException('Email already exists');
  }
  
  // Business rules validation
  if (dto.age && dto.age < 18) {
    throw new BadRequestException('Must be 18 or older');
  }
  
  // Additional business rules...
}
```

### Pattern 5: Complex Entity with Relations
```typescript
@AutoEntity()
export class Order {
  id: number;
  userId: number;
  products: Product[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Service
async createOrder(dto: CreateOrderDto): Promise<Order> {
  const products = await this.validateProducts(dto.productIds);
  const totalAmount = this.calculateTotal(products, dto.quantities);
  
  // @AutoEntity makes complex object creation simple
  const order = new Order({
    userId: dto.userId,
    products: products,
    totalAmount: totalAmount,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return await this.ordersRepository.save(order);
}
```

### Pattern 6: Response Transformation
```typescript
// Controller
@GetByIdEndpoint('User', UserDetailResponseDto)
async findOne(@Param('id', ParseIntPipe) id: number) {
  const user = await this.usersService.findOneWithRelations(id);
  // @AutoResponse automatically maps entity to DTO with only exposed fields
  return new UserDetailResponseDto(user);
}

// Different response for different endpoints
@GetAllEndpoint('User', UserListItemResponseDto)
async findAll() {
  const users = await this.usersService.findAll();
  // Different DTO exposes different fields for list view
  return new UserListResponseDto(users.map(u => new UserListItemResponseDto(u)));
}
```

## Summary

This NestJS architecture provides a **clean, maintainable, and scalable** foundation similar to .NET's best practices. By leveraging three powerful decorators (`@AutoEntity`, `@AutoApplyDecorators`, `@AutoResponse`) along with base classes and TypeScript generics, you eliminate boilerplate and focus purely on business logic.

**Key Philosophy**: Write business logic, not boilerplate.

### What Makes This Architecture Special:

1. **Zero Boilerplate Entities** - `@AutoEntity()` eliminates manual constructors
2. **Centralized Configuration** - All validation and documentation rules in config files
3. **Automatic Mapping** - Entity ↔ DTO transformations handled automatically
4. **Type Safety** - Full TypeScript support with compile-time checking
5. **Consistent API** - BaseController provides uniform REST endpoints
6. **Developer Experience** - Write less code, get more functionality

### The Result:

**Before decorators:**
- Manual constructors with 10-20 lines of property mapping
- Repeated validation decorators on every DTO field
- Manual entity-to-DTO transformations everywhere
- Duplicate Swagger documentation

**After decorators:**
- One-line entity definition with `@AutoEntity()`
- Properties defined once, decorators applied automatically
- Automatic mapping with `new ResponseDto(entity)`
- Swagger docs generated from centralized config

**You write 70% less code and focus on what matters: your business logic.**

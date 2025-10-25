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
- `@AutoApplyDecorators(mapping)` - Input DTOs with automatic validation
- `@AutoResponse(mapping)` - Response DTOs with automatic mapping + Swagger

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
import { CreateUserMapping } from './mapping';

@AutoApplyDecorators(CreateUserMapping)
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
  age?: number;
  role?: string;
}

// In dto/mapping.ts
export const CreateUserMapping = {
  name: () => StringField('User full name', 'John Doe'),
  email: () => EmailField('User email address', 'john@example.com'),
  age: () => NumberField('User age', 25, false, 18, 100),
  role: () => StringField('User role', 'user', false),
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
import { AutoResponse, ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';
import { UserResponseMapping } from './mapping';

@AutoResponse(UserResponseMapping)
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  age?: number;
  role: string;
}

// In responses/mapping.ts
export const UserResponseMapping: Record<string, ResponseFieldConfig> = {
  name: { description: 'User full name', example: 'John Doe', required: true, type: String },
  email: { description: 'User email', example: 'john@example.com', required: true, type: String },
  age: { description: 'User age', example: 25, required: false, type: Number },
  role: { description: 'User role', example: 'user', required: true, type: String },
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

**ResponseFieldConfig Properties:**
- `description`: Field description for Swagger
- `example`: Example value for Swagger
- `required`: Whether field is required
- `type`: Explicit type (String, Number, Boolean) - recommended for better Swagger inference
- `enum`: Enum type for enum fields (e.g., `enum: PaymentStatus`)
- `isArray`: Set to `true` for array fields

**Example with Enum:**
```typescript
import { PaymentStatusType } from '../enums/payment-status.enum';

export const PaymentResponseMapping: Record<string, ResponseFieldConfig> = {
  amount: { description: 'Payment amount', example: 99.99, required: true, type: Number },
  status: { description: 'Payment status', example: 'completed', required: true, enum: PaymentStatusType },
  tags: { description: 'Payment tags', example: ['online', 'express'], required: false, type: String, isArray: true },
};
```

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
- Per-module mappings in `dto/mapping.ts` and `responses/mapping.ts`

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

**Repository Usage:** Inject with `@InjectRepository(Entity)`, use methods: `find()`, `findOne()`, `save()`, `remove()`, `createQueryBuilder()`

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
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── mapping.ts           # Field validation mappings
│   │   ├── entities/                # Domain entities
│   │   │   └── user.entity.ts
│   │   ├── enums/                   # Module-specific enums (naming: *Type)
│   │   │   └── user-role.enum.ts    # e.g., UserRoleType
│   │   ├── responses/               # Response DTOs
│   │   │   ├── user-response.dto.ts
│   │   │   ├── user-list-response.dto.ts
│   │   │   └── mapping.ts           # Response field mappings
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

### Module Organization Rules:

**Enums:**
- Store all module-specific enums in the `enums/` folder
- Naming convention: `[name]Type` (e.g., `PaymentStatusType`, `UserRoleType`, `OrderStatusType`)
- File naming: `[kebab-case].enum.ts` (e.g., `payment-status.enum.ts`, `user-role.enum.ts`)
- The `Type` suffix makes it immediately clear that the import is an enum type

**Example Enum Structure:**
```typescript
// modules/payment/enums/payment-status.enum.ts
export enum PaymentStatusType {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
```

**Usage:**
```typescript
// In entities
import { PaymentStatusType } from '../enums/payment-status.enum';

// In services
import { PaymentStatusType } from './enums/payment-status.enum';

// In response mappings
import { PaymentStatusType } from '../enums/payment-status.enum';
```

## Development Checklist

### When Adding New Feature:

1. **Create Enums** (if needed): `modules/[feature]/enums/[name].enum.ts` with `Type` suffix (e.g., `PaymentStatusType`)
2. **Create Entity**: Add `@AutoEntity()` decorator, define properties only
3. **Create Field Mappings**: `dto/mapping.ts` with validation configs
4. **Create Input DTOs**: Add `@AutoApplyDecorators(mapping)`, extend `BaseCreateDto`/`BaseUpdateDto`
5. **Create Response Mappings**: `responses/mapping.ts` with Swagger configs
6. **Create Response DTOs**: Add `@AutoResponse(mapping)`, extend `BaseResponseDto`
7. **Create List Response**: Extend `BaseListResponseDto<T>` (empty class)
8. **Create Service**: Implement business logic with validation
9. **Create Controller**: Extend `BaseController`, use endpoint decorators
10. **Create Module**: Register entity, controller, service
11. **Register in AppModule**: Import the new module
12. **Test**: Run `npm run start:dev` and verify in Swagger

**See Core Principles section above for detailed code examples.**

### Code Quality Standards:

- **Async/Await**: All repository and service methods must be async
- **Validation First**: Validate all inputs before business logic
- **Structured Errors**: Use NestJS built-in exceptions with descriptive messages
- **Separation of Concerns**: Controllers (HTTP) → Services (business) → Repositories (data)
- **Single Responsibility**: Each class/method has one clear purpose
- **Type Safety**: Leverage TypeScript for compile-time checking
- **Naming Convention**: Enums use `Type` suffix (e.g., `PaymentStatusType`)

## Best Practices

### DO: ✅

✅ Use `@AutoEntity()`, `@AutoApplyDecorators(mapping)`, `@AutoResponse(mapping)` on all classes  
✅ Extend base classes: `BaseController`, `BaseResponseDto`, `BaseListResponseDto<T>`  
✅ Keep controllers thin - delegate to services  
✅ Services return entities, controllers transform to DTOs  
✅ Validate business rules in service layer before operations  
✅ Use constructor injection with `private readonly` pattern  
✅ Throw NestJS built-in exceptions with descriptive messages  
✅ Store enums in `enums/` folder with `Type` suffix  

### DON'T: ❌

❌ Write manual constructors or property mapping  
❌ Repeat decorators on every field  
❌ Implement business logic in controllers  
❌ Access repositories directly from controllers  
❌ Return raw entities without response DTOs  
❌ Use `any` type excessively  
❌ Skip validation in service layer  

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

// 2. Input DTOs - Validation from mapping
@AutoApplyDecorators(CreateUserMapping)
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}

// 3. Response DTOs - Auto-mapping + Swagger
@AutoResponse(UserResponseMapping)
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
}

// 4. List Response DTOs - Empty class, no constructor!
export class UserListResponseDto extends BaseListResponseDto<UserResponseDto> {}
```

### Alternative: Inline Field Decorators

Use inline decorators instead of centralized config: `@StringField()`, `@EmailField()`, `@NumberField()`, `@EnumField()`, `@BooleanField()`

**Recommended**: Use centralized `@AutoApplyDecorators(mapping)` for better maintainability.

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

### Module Mappings (Per-Module Approach)

**Field Mappings:** `modules/[feature]/dto/mapping.ts`
```typescript
import { StringField, EmailField } from '../../../common/decorators/field.decorator';

export const CreateUserMapping = {
  name: () => StringField('User name', 'John Doe'),
  email: () => EmailField('User email', 'john@example.com'),
};
```

**Response Mappings:** `modules/[feature]/responses/mapping.ts`
```typescript
import { ResponseFieldConfig } from '../../../common/decorators/auto-response.decorator';

export const UserResponseMapping: Record<string, ResponseFieldConfig> = {
  name: { description: 'User name', example: 'John Doe', required: true, type: String },
  email: { description: 'User email', example: 'john@example.com', required: true, type: String },
};
```

✅ **Benefits of per-module mappings:**
- Better modularity - each module owns its configuration
- Type-safe - pass objects, not strings
- Easier to refactor - no centralized coupling
- Clear dependencies - imports show relationships

⚠️ **Important: Always specify `type` or `enum` in response mappings to prevent Swagger circular dependency errors!**

## Summary

This architecture eliminates 70% of boilerplate code through three powerful decorators:
- `@AutoEntity()` - Automatic constructors
- `@AutoApplyDecorators()` - Centralized validation
- `@AutoResponse()` - Auto entity-to-DTO mapping

**Focus on business logic, not repetitive code.**

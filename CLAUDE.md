# CLAUDE.md — NestJS Project Guidelines

You are an expert NestJS backend engineer. Before making **any** decision — architectural, structural, or implementation — you must **think first**. Reason through the problem, evaluate trade-offs, and only then act. Never guess. Never assume. Ask for clarification when intent is ambiguous.

---

## 🧠 Think Before You Act

Before writing or modifying any code, answer these questions internally:

1. **What is the exact problem being solved?**
2. **Where does this belong in the NestJS architecture?** (Module / Service / Conroller / Guard / Pipe / Interceptor / Decorator?)
3. **Does a pattern already exist in this codebase I should follow?**
4. **What are the failure modes?** (validation errors, DB errors, auth failures, race conditions)
5. **Does this touch the database?** If yes — review the Prisma schema first before writing a single line.
6. **Will this break existing contracts?** (DTOs, API responses, Swagger docs, JWT payloads)

Only proceed once you can answer all relevant questions confidently.

---

## 📁 Project Structure

Enforce this structure strictly. Do not deviate without explicit instruction.

```
src/
├── modules/
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts   # HTTP only
│       ├── <feature>.service.ts      # business logic only
│       ├── <feature>.repository.ts   # all DB queries (Prisma) only
│       ├── dto/
│       │   ├── create-<feature>.dto.ts
│       │   └── update-<feature>.dto.ts
│       └── entities/         # (if not using Prisma types directly)
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── config/
│   └── configuration.ts
└── main.ts
```

**Rules:**
- One module per feature domain. No cross-feature imports unless through a shared module.
- **Controller** → HTTP only: request parsing, calling services, returning responses. No logic, no DB.
- **Service** → Business logic only: rules, decisions, orchestration. Never imports or calls PrismaService directly.
- **Repository** → DB access only: all Prisma queries live here and nowhere else.
- No raw SQL. Prisma only.

---

## 🗄️ Prisma

- **Always read `schema.prisma` before writing any query or migration.**
- Use Prisma's generated types everywhere — do not redefine model shapes manually.
- Never use `prisma.$queryRaw` unless there is no Prisma alternative and it is explicitly approved.
- Always handle `PrismaClientKnownRequestError` — especially:
  - `P2002` → unique constraint violation
  - `P2025` → record not found
- Wrap multi-step operations in `prisma.$transaction([...])`.
- Use `select` or `include` explicitly — never return entire models with sensitive fields (passwords, tokens).

```typescript
// ✅ Correct
const user = await this.prisma.user.findUniqueOrThrow({
  where: { id },
  select: { id: true, email: true, role: true },
});

// ❌ Wrong — exposes all fields
const user = await this.prisma.user.findUnique({ where: { id } });
```

---

## 🏛️ Repository Pattern (Mandatory)

The three-layer rule is **strictly enforced**:

```
Controller  →  Service  →  Repository  →  PrismaService
```

**Services never import or call `PrismaService` directly.** All database access goes through a repository. This keeps services fully unit-testable by mocking only the repository.

### Repository responsibilities
- All Prisma queries (`findUnique`, `create`, `update`, `delete`, etc.)
- Handling `PrismaClientKnownRequestError` and rethrowing as domain-neutral errors or raw data — **not** as `HttpException` (that is the service's job)
- Applying `select` / `include` to control which fields are returned
- Transactions that span multiple queries within the same domain

### Service responsibilities
- Business rules and decisions
- Calling one or more repository methods and composing their results
- Throwing `HttpException` subclasses (`NotFoundException`, `ConflictException`, etc.)
- Never touching `PrismaService` or writing query logic

```typescript
// ✅ Repository — DB concerns only
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}

// ✅ Service — business logic only, no Prisma
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUser(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}

// ❌ Wrong — service imports PrismaService directly
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {} // NEVER
}
```

### Module wiring
Repositories must be declared as providers and exported within their feature module so services can inject them:

```typescript
@Module({
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

### Cross-domain data access
If Feature A needs data owned by Feature B, it imports Feature B's **service** — never Feature B's repository directly.

---

## 🌐 REST API Design

- Use RESTful resource naming: plural nouns, no verbs in paths (`/users`, `/orders/:id`).
- HTTP status codes must be semantically correct:
  - `200` OK, `201` Created, `204` No Content
  - `400` Bad Request (validation), `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict
- Always return a consistent response shape. Define and reuse response classes.
- Use `@HttpCode()` explicitly when the default (`200`) is wrong.
- Version the API if the project has or plans to have breaking changes (`/v1/`).

---

## ✅ DTOs & Validation

- Every controller input **must** have a DTO with `class-validator` decorators.
- Enable global `ValidationPipe` with these exact options:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,              // auto-transform payloads to DTO instances
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

- Use `@IsOptional()` deliberately — do not mark fields optional unless the business logic requires it.
- Use `PartialType(CreateDto)` for update DTOs. Never duplicate fields.

---

## 🔐 JWT Auth & Guards

- All routes are **private by default**. Public routes must be explicitly decorated with `@Public()`.
- Use a custom `@Public()` decorator + `JwtAuthGuard` applied globally.
- Never trust data from the JWT payload for critical operations — always re-fetch from DB if freshness matters.
- Store only non-sensitive identifiers in JWT payload (`sub`, `role`).
- Access tokens: short-lived (15m). Refresh tokens: long-lived, stored securely.
- Guards go on the controller or route level — never inside service methods.

```typescript
// ✅ Global guard with public escape hatch
@UseGuards(JwtAuthGuard)   // applied globally in AppModule
@Public()                  // opt-out decorator for open routes
```

---

## 📄 Swagger / OpenAPI

- Every controller and every DTO must be fully documented.
- Use `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()` on all controllers.
- Use `@ApiProperty()` on all DTO fields — include `example`, `description`, and `required`.
- Use `@ApiBearerAuth()` on all protected controllers.
- Swagger setup must be in `main.ts` and **never** exposed in production without auth protection.

```typescript
// DTO example
@ApiProperty({ example: 'john@example.com', description: 'User email address' })
@IsEmail()
email: string;
```

---

## 🐳 Docker

- The project must run fully via `docker-compose up` — no manual setup steps.
- `docker-compose.yml` must define: app service, PostgreSQL service, and any other dependencies.
- Use `.env` files for environment variables — never hardcode values in compose files.
- Health checks must be defined on the database service before the app starts.
- Prisma migrations must run as part of container startup (`prisma migrate deploy`, not `migrate dev`).

```yaml
# Startup command in docker-compose
command: sh -c "npx prisma migrate deploy && node dist/main"
```

---

## ⚠️ Error Handling

- Use a global `HttpExceptionFilter` to standardize all error responses.
- Never let Prisma errors or raw JS errors bubble up to the client unhandled.
- Service methods throw `HttpException` subclasses (`NotFoundException`, `ConflictException`, etc.) — not generic `Error`.
- Log errors with context (module, method, input shape) — never log raw passwords or tokens.

---

## 🔒 Security Rules (Non-Negotiable)

- Never log request bodies that may contain credentials.
- Never return password hashes, tokens, or internal IDs in API responses.
- Always hash passwords with `bcrypt` (min 10 rounds) — never `md5` or `sha`.
- Environment variables for all secrets. No secrets in code or git.
- Use `helmet()` and `cors()` in `main.ts`.

---

## 🧪 Code Quality

- No `any` types. Use Prisma-generated types or explicit interfaces.
- No unused imports, variables, or dead code.
- Services must be unit-testable by mocking only the repository — `PrismaService` should never appear in a service's constructor.
- Repositories must be unit-testable by mocking only `PrismaService`.
- Keep controllers thin: no business logic, no DB calls, no conditional branching beyond input routing.
- If a method exceeds ~30 lines, question whether it should be decomposed.

---

## 📋 Pre-Task Checklist

Before starting any task, verify:

- [ ] I have read the relevant module(s) in the codebase
- [ ] I have checked `schema.prisma` if this touches the database
- [ ] I know which layer this change belongs in (Controller / Service / Repository)
- [ ] I am not writing Prisma queries inside a service
- [ ] I know which DTOs, guards, or interceptors are involved
- [ ] I know what Swagger documentation needs updating
- [ ] I have considered error cases and how they will be handled
- [ ] I understand if auth/authorization is involved and which roles apply

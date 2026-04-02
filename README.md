# Finance Data Processing and Access Control Backend

Backend API for finance data processing with role-based access control, soft-delete records, dashboard analytics, and consistent validation/error handling.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- Zod
- JWT
- bcryptjs

## Quick Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

- Create a `.env` file and set:
  - `NODE_ENV=development`
  - `PORT=3000`
  - `DATABASE_URL=file:./dev.db`
  - `JWT_SECRET=<at least 16 chars>`
  - `JWT_EXPIRES_IN=7d`
  - `BCRYPT_SALT_ROUNDS=10`

3. Generate Prisma client and apply schema

```bash
npm run db:generate
npm run db:push
```

4. Seed sample data

```bash
npm run db:seed
```

5. Start the server

```bash
npm run dev
```

Base URL: `http://localhost:3000`

## Database Schema

Schema file: `prisma/schema.prisma`

### Enums

- Role: VIEWER, ANALYST, ADMIN
- UserStatus: ACTIVE, INACTIVE
- RecordType: INCOME, EXPENSE
- AuditAction: CREATE, UPDATE, DELETE, LOGIN, LOGOUT

### Models

- User
  - `id, name, email (unique), password, role, status, createdAt, updatedAt`
- Record
  - `id, amount, type, category, date, notes, createdById, updatedById`
  - soft delete fields: `isDeleted, deletedAt`
- AuditLog
  - `id, action, entityType, entityId, metadata, performedById, createdAt`

### Indexing

Record indexes include:
- `type`
- `category`
- `date`
- `isDeleted`
- `createdById`
- composite indexes: `[type, category]`, `[isDeleted, date]`

## Authentication and Authorization

### JWT

- Login: `POST /auth/login`
- Protected routes require:

```http
Authorization: Bearer <token>
```

- Invalid/expired token -> `401`
- Inactive user -> `403`

### Permissions

- VIEWER
  - read records
  - read dashboard summary
- ANALYST
  - read records
  - read dashboard summary and analytics (`/dashboard/trends`, `/dashboard/category-summary`)
- ADMIN
  - full user management
  - full record management
  - full dashboard access

## API Routes

### Auth

- POST `/auth/login`

### Users (ADMIN)

- GET `/users`
- POST `/users`
- GET `/users/:id`
- PATCH `/users/:id`

### Records

- GET `/records` (VIEWER, ANALYST, ADMIN)
- POST `/records` (ADMIN)
- GET `/records/:id` (VIEWER, ANALYST, ADMIN)
- PATCH `/records/:id` (ADMIN)
- DELETE `/records/:id` (ADMIN, soft delete)

### Dashboard

- GET `/dashboard/summary` (VIEWER, ANALYST, ADMIN)
- GET `/dashboard/trends` (ANALYST, ADMIN)
- GET `/dashboard/category-summary` (ANALYST, ADMIN)

## Backend Design

The codebase is organized by modules and layers:

- routes: request mapping and middleware composition
- controllers: thin request/response orchestration
- services: business rules and use-case logic
- repositories: Prisma-only data access
- middlewares: authentication, authorization, validation, and error handling
- utils/types: shared contracts, response helpers, constants, and request typing

This separation keeps database access out of controllers and keeps business logic out of route files.

## Business Rules Implemented

- inactive users are blocked on protected routes
- VIEWER cannot create, update, or delete users/records
- ANALYST cannot modify users/records
- ADMIN has full user and record management permissions
- records are soft deleted and hidden from normal queries
- deleted records can be queried only by ADMIN using `includeDeleted=true`

## Filtering, Pagination, and Sorting

Records list supports:

- filters: `type`, `category`, `dateFrom`, `dateTo`, `search`
- pagination: `page`, `limit`
- sorting: `sortBy`, `sortOrder`
- soft-delete filter: `includeDeleted` (admin-only)

Validation also enforces date-range correctness (`dateFrom <= dateTo`) for records and dashboard date query endpoints.

## Validation and Error Handling

Validation uses Zod and returns `422` on validation failures.

Success response format:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error response format:

```json
{
  "success": false,
  "message": "...",
  "errorCode": "..."
}
```

Common statuses:
- `400` bad request
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` conflict
- `422` validation error

Prisma known request errors are mapped into consistent API errors in centralized middleware.

## Seed Data

Seed file: `prisma/seed.ts`

Creates:
- 1 admin user
- 1 analyst user
- 1 viewer user
- 29 financial records
- audit log entries

Default credentials:
- Admin: `admin@finance.local` / `Admin@123`
- Analyst: `analyst@finance.local` / `Analyst@123`
- Viewer: `viewer@finance.local` / `Viewer@123`

## Useful Commands

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run test:watch`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:seed`

## Reliability Checks

- TypeScript compile check:

```bash
npm run build
```

- Focused behavior tests:

```bash
npm run test
```

- Seed reliability check:

```bash
npm run db:seed
```

Both commands are expected to complete successfully in a fresh local setup.

## Assumptions

- Soft delete is implemented for records only.
- Normal record listing excludes deleted records.
- `includeDeleted=true` is honored only for ADMIN requests.
- User email is immutable via current update endpoint.

## Tradeoffs and Scope Notes

- SQLite is used for local-first simplicity; for higher concurrency workloads, a server database can be introduced in a later phase.
- No refresh token flow is implemented in this phase; authentication currently uses access-token-only JWT.
- Automated integration tests are not included yet; current reliability is validated through strict typing, route guards, and runtime checks.
- Audit logging currently captures key actions (for example, login) and can be extended for full CRUD event coverage.

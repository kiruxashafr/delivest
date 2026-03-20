# Delivest

Delivest is a modern food ordering and delivery service with a CRM system built on the pnpm monorepo. The product is currently in development.

> **Work in progress.** Most of the system is not production-ready yet.

## Tech Stack

### Backend

NestJS, Prisma, PostgreSQL, JWT, Argon2, MinIO, Full test setup with Jest and Testcontainers

### Frontend

Vue

### Monorepo

Pnpm workspace

### Applications:

- apps/delivest-api
- apps/delivest-web

## Development

```bash
# Install dependencies:
npm install

# Start application:
pnpm build
```

## Testing

```bash
# Unit tests:
pnpm test


# Static checks:
pnpm audit
pnpm run lint
```

## CI

GitHub Actions run audit, linting, typechecking, unit tests, and build checks.
Triggered on pull requests and pushes to main and develop branches.

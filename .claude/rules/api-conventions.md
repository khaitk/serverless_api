---
paths:
  - "src/controllers/**/*.ts"
  - "src/handlers/**/*.ts"
  - "src/dto/**/*.ts"
  - "src/middlewares/**/*.ts"
---

# API Conventions
- REST with plural nouns: `/notes`, `/notes/{id}`. Public routes (login) live under `/auth`.
- Success: 200 (read/update), 201 (create), 204 (delete, empty body).
- Errors always use `{ "error": { "code": string, "message": string } }` via `AppError` subclasses
  (400 validation, 401 unauthenticated, 403 forbidden, 404 not found).
- Validate every request body with a zod schema from `src/dto/`; never read `event.body` directly in a service.
- Handlers must be wrapped with `protectedRoute(...)` or `publicRoute(...)`; a route is public only on purpose.
- Restrict sensitive operations with `requireRole(...)` after the auth middleware.

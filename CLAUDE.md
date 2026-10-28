# Project Overview

Serverless REST API on AWS: **API Gateway + Lambda (Node.js 24, TypeScript) + S3**, deployed with AWS SAM.
Requests are authenticated with a 1-hour JWT obtained from `POST /auth/login` using HTTP Basic credentials.

## Tech Stack
- Runtime: Node.js 24 (`nodejs24.x`, arm64), ESM modules
- Language: TypeScript (strict)
- Infra / build: AWS SAM (`template.yaml`) with esbuild
- Storage: S3 (JSON objects)
- Validation: zod (DTO schemas)
- Auth: `jose` (HS256 JWT)

## Architecture
Request flow: `API Gateway -> handler -> middlewares -> controller -> service -> repository -> S3`

```
src/
  handlers/      Lambda entry points; only wire middlewares around a controller method
  middlewares/   error, auth (JWT), role; composed with protectedRoute / publicRoute
  controllers/   HTTP <-> service translation; parse DTOs; no business logic
  services/      business logic; depend on repository interfaces only
  repositories/  data access (S3); implement repository interfaces
  dto/           zod schemas + inferred request types
  interfaces/    domain models and contracts (repository, service, middleware)
  utils/         errors, HTTP helpers
  config/        environment variable access
  container.ts   dependency wiring (created once per cold start)
```

## Commands
- `npm run typecheck` – type-check the project (run after every change)
- `npm run build` – `sam build`
- `npm run local` – `sam local start-api` (needs `env.json`, see README)
- `npm run deploy` – `sam deploy --guided`

## Conventions
Detailed rules live in `.claude/rules/`. Use the `add-endpoint` skill to scaffold new resources
and the `deploy` skill for deployments.

## Notes
- Personal instructions go in `CLAUDE.local.md` (git-ignored).
- Never commit secrets; `JWT_SECRET`, `BASIC_AUTH_*` are SAM parameters.

---
paths:
  - "src/**/*.ts"
---

# Code Style
- 2 spaces, single quotes, semicolons.
- camelCase for variables/functions, PascalCase for classes/types, `kebab.case.ts` file names (`note.service.ts`).
- Relative imports must include the `.js` extension (ESM).
- Keep functions short with a single responsibility; avoid `any` (use `unknown` and narrow).
- Use `import type` for type-only imports.
- Throw `AppError` subclasses (`src/utils/errors.ts`); never return error responses manually from services.

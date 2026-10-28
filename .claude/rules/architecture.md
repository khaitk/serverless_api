---
paths:
  - "src/**/*.ts"
---

# Layering Rules
- `handlers` -> `controllers` -> `services` -> `repositories`. Never skip or reverse a layer.
- Services and controllers depend on **interfaces** (`src/interfaces/`), not concrete classes.
- Only `src/container.ts` instantiates concrete classes and AWS SDK clients (reused across warm invocations).
- Only repositories talk to S3 or other AWS services.
- Read configuration through `src/config/env.ts`, never `process.env` elsewhere.
- Each Lambda function gets its own `Handler` entry in `template.yaml` with least-privilege policies
  (`S3ReadPolicy` for reads, `S3CrudPolicy` only where writes are needed).

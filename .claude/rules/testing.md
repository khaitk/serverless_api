---
paths:
  - "tests/**/*.ts"
  - "src/**/*.test.ts"
---

# Testing
- No test framework is installed yet. When adding one, prefer Vitest (native ESM + TypeScript) and add an `npm test` script.
- Unit-test services with fake repositories that implement the repository interface; do not hit S3.
- Test controllers by passing a minimal `APIGatewayProxyEvent` and a fake service.
- Use Arrange–Act–Assert; name tests after the behavior ("returns 404 when note does not exist").
- Never call real AWS services or the network in tests.

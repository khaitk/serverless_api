---
name: add-endpoint
description: Scaffold a new REST resource or endpoint across all layers (dto, interface, repository, service, controller, handler, template.yaml). Use when the user wants to add or extend an API resource.
---

# Add Endpoint Skill

Use the existing `note` resource as the reference implementation and follow `.claude/rules/`.
Replace `<name>` with the singular resource name (e.g. `task`).

1. **Interface** – `src/interfaces/<name>.interface.ts` (model), `<name>.repository.interface.ts`, `<name>.service.interface.ts`.
2. **DTO** – `src/dto/<name>.dto.ts` with zod create/update schemas and inferred types.
3. **Repository** – `src/repositories/<name>.repository.ts` implementing the interface (S3 key prefix `<name>s/`).
4. **Service** – `src/services/<name>.service.ts`; throw `NotFoundError` etc. for domain failures.
5. **Controller** – `src/controllers/<name>.controller.ts`; arrow-function members, parse bodies with `parseBody`.
6. **Wire up** – instantiate repo/service/controller in `src/container.ts`.
7. **Handler** – `src/handlers/<name>.handler.ts`, wrapping each method with `protectedRoute(...)`
   (add `requireRole(...)` for destructive operations).
8. **Infra** – in `template.yaml` add one `AWS::Serverless::Function` per route using `Metadata: *build`,
   add the new handler file to the `EntryPoints` list, and grant the narrowest S3 policy
   (`S3ReadPolicy` for reads, `S3CrudPolicy` for writes).
9. Run `npm run typecheck` and `sam validate --lint`, then summarize the new routes and their required roles.

Do not mark a route public unless the user explicitly asks for it.

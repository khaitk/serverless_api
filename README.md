# Serverless API

A serverless REST API built with **TypeScript on Node.js 24**, running on **AWS Lambda** behind
**API Gateway**, with **S3** for storage. Infrastructure is defined with **AWS SAM**.

Sample resource: `notes` (CRUD). Authentication: HTTP Basic login that issues a **1-hour JWT**.

## Architecture

```
Client -> API Gateway -> Lambda handler -> middlewares -> controller -> service -> repository -> S3
```

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Handler | `src/handlers/` | Lambda entry points; wraps a controller method with middlewares |
| Middleware | `src/middlewares/` | Error formatting, JWT auth, role checks |
| Controller | `src/controllers/` | HTTP <-> service translation, DTO parsing |
| Service | `src/services/` | Business logic |
| Repository | `src/repositories/` | Data access (S3 JSON objects) |
| DTO | `src/dto/` | zod request schemas and inferred types |
| Interfaces | `src/interfaces/` | Models and contracts for repositories, services, middlewares |
| Utils / Config | `src/utils/`, `src/config/` | Errors, HTTP helpers, environment access |
| Container | `src/container.ts` | Dependency wiring, created once per cold start |

## Project Structure

```
.
├── CLAUDE.md, CLAUDE.local.md      # Claude Code project context
├── .mcp.json                       # MCP servers (GitHub, Postgres)
├── .claude/                        # Claude Code config: settings, rules, commands, skills, agents, hooks
├── src/                            # application code (layers above)
├── template.yaml                   # SAM template: API, Lambdas, S3 bucket
├── env.example.json                # sample env vars for `sam local`
├── package.json, tsconfig.json
└── README.md
```

## Prerequisites
- Node.js 24+
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- AWS credentials configured (`aws configure`)
- Docker (only for `sam local`)

## Getting Started

```bash
npm install
npm run typecheck
```

### Run locally
```bash
cp env.example.json env.json     # edit values; DATA_BUCKET must be an existing S3 bucket
npm run build
npm run local                    # http://127.0.0.1:3000
```

## Deployment

### 1. Prepare AWS
- An AWS account and an IAM user/role allowed to create CloudFormation stacks, Lambda functions,
  API Gateway APIs, S3 buckets, and IAM roles.
- Credentials configured locally: `aws configure` (or `aws sso login`). Check with `aws sts get-caller-identity`.
- Pick a region that supports the `nodejs24.x` Lambda runtime. If your region does not yet, change `Runtime` in `template.yaml`.

### 2. Validate and build
```bash
npm install
npm run typecheck
sam validate --lint
npm run build            # runs `sam build`; esbuild bundles each handler into .aws-sam/build
```

### 3. First deploy (guided)
Generate secrets first, for example:
```bash
openssl rand -base64 48   # use as JwtSecret
```
Then run:
```bash
sam deploy --guided \
  --stack-name serverless-api-dev \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides Stage=dev JwtSecret=<32+ chars> BasicAuthUser=<user> BasicAuthPassword=<12+ chars>
```
`--guided` asks for stack name, region and confirmations, then saves the answers to `samconfig.toml`
(git-ignored). Secret parameters are `NoEcho`, so they are not shown in the CloudFormation console.
Review the changeset and approve it.

### 4. Get the API URL
```bash
aws cloudformation describe-stacks --stack-name serverless-api-dev \
  --query "Stacks[0].Outputs" --output table
```
`ApiUrl` is your base URL (`https://<id>.execute-api.<region>.amazonaws.com/Prod`) and
`DataBucketName` is the private S3 bucket holding the data.

### 5. Verify
```bash
API_URL=<ApiUrl from step 4>
curl -i "$API_URL/notes"                                   # expect 401 (no token)
curl -u <user>:<password> -X POST "$API_URL/auth/login"    # expect 200 + token
```

### Updating an existing deployment
```bash
npm run typecheck && npm run build
sam deploy --parameter-overrides Stage=dev JwtSecret=<...> BasicAuthUser=<...> BasicAuthPassword=<...>
```
Without `--guided`, SAM reuses the saved `samconfig.toml`. Parameters must be passed again unless you keep
them in `samconfig.toml` (do not commit that file).

### Production
Use a separate stack and different secrets:
```bash
sam deploy --stack-name serverless-api-prod --parameter-overrides Stage=prod JwtSecret=<different> ...
```
Keep the confirmation prompt on (do not use `--no-confirm-changeset`) so you can review the changeset.

### Logs and troubleshooting
```bash
sam logs --stack-name serverless-api-dev --tail          # all functions
sam logs --stack-name serverless-api-dev --name CreateNoteFunction --tail
```
| Symptom | Likely cause |
|---------|--------------|
| `The runtime parameter of nodejs24.x is not supported` | Region lacks Node 24 support; pick another region or lower the runtime |
| `Missing environment variable: ...` in logs | A SAM parameter was not passed to `sam deploy` |
| `401 Invalid or expired token` | Token older than 1 hour, wrong `JwtSecret` between deploys, or missing `Bearer ` prefix |
| `403` on `DELETE /notes/{id}` | Token lacks the `admin` role |
| `AccessDenied` from S3 | Function policy in `template.yaml` is too narrow for the operation |
| Stack stuck in `ROLLBACK_COMPLETE` | Delete the stack and redeploy: `sam delete --stack-name <name>` |

### Tear down
```bash
sam delete --stack-name serverless-api-dev
```
The data bucket must be emptied first (`aws s3 rm s3://<DataBucketName> --recursive`), otherwise deletion fails.
This permanently removes the stack and its data.

Never commit secrets; `samconfig.toml` and `env.json` are git-ignored.

## Configuration

| SAM parameter | Env variable | Description |
|---------------|--------------|-------------|
| `Stage` | – | Deployment stage |
| `JwtSecret` | `JWT_SECRET` | HS256 signing secret (32+ chars) |
| `BasicAuthUser` | `BASIC_AUTH_USER` | Login username |
| `BasicAuthPassword` | `BASIC_AUTH_PASSWORD` | Login password (12+ chars) |
| – | `DATA_BUCKET` | Data bucket name (set by the template) |

## Authentication

1. Log in with Basic credentials to get a token (valid for 1 hour):
   ```bash
   curl -u admin:<password> -X POST "$API_URL/auth/login"
   # {"token":"<jwt>","tokenType":"Bearer","expiresIn":3600}
   ```
2. Send it on every other request:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" "$API_URL/notes"
   ```
3. After expiry the API returns `401`; log in again.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Basic | Issue a JWT |
| POST | `/notes` | Bearer | Create a note (`{ "title", "content" }`) |
| GET | `/notes` | Bearer | List notes |
| GET | `/notes/{id}` | Bearer | Get a note |
| PUT | `/notes/{id}` | Bearer | Update a note |
| DELETE | `/notes/{id}` | Bearer + `admin` role | Delete a note |

Errors use a single shape: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`.

## Adding a New Endpoint
1. Define the model and repository/service interfaces in `src/interfaces/`.
2. Add zod schemas in `src/dto/`.
3. Implement the repository, service, and controller.
4. Wire them in `src/container.ts`.
5. Export handlers wrapped with `protectedRoute(...)` in `src/handlers/`.
6. Add the function(s) and the handler entry point in `template.yaml`.

With Claude Code you can do this in one step with the `add-endpoint` skill.

## Using Claude Code with this project

| Item | Purpose |
|------|---------|
| `CLAUDE.md` | Project context, architecture, commands |
| `.claude/rules/` | `code-style`, `architecture`, `api-conventions`, `testing` (path-scoped) |
| `.claude/commands/` | `/review`, `/fix-issue <number>` |
| `.claude/skills/` | `add-endpoint` (scaffold a resource), `deploy` (build + deploy with SAM; user-invoked only) |
| `.claude/agents/` | `code-reviewer`, `security-auditor` |
| `.claude/hooks/` | `validate-bash.sh` blocks dangerous shell commands |
| `.mcp.json` | GitHub and Postgres MCP servers (needs `GITHUB_TOKEN`, `DATABASE_URL`) |

## Notes and Limitations
- A single login account is configured through environment variables; multi-user support needs a user store.
- Storing data in S3 suits small datasets; consider DynamoDB for querying.
- Add API Gateway throttling to `/auth/login` to slow brute-force attempts.
- No automated tests yet (see `.claude/rules/testing.md`).

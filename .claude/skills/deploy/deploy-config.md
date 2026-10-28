# Deploy Config

| Stage | Stack name           | Command |
|-------|----------------------|---------|
| dev   | `serverless-api-dev`  | `sam deploy --stack-name serverless-api-dev --parameter-overrides Stage=dev ...` |
| prod  | `serverless-api-prod` | `sam deploy --stack-name serverless-api-prod --parameter-overrides Stage=prod ...` |

## Required parameters (`--parameter-overrides`)
| Parameter | Notes |
|-----------|-------|
| `Stage` | `dev` or `prod` |
| `JwtSecret` | HS256 secret, at least 32 characters, different per stage |
| `BasicAuthUser` | login username |
| `BasicAuthPassword` | login password, at least 12 characters |

Pass secrets from the user's environment or `samconfig.toml` (git-ignored); never write them into tracked files.

## Common flags
- `--capabilities CAPABILITY_IAM --resolve-s3` for first-time deploys.
- `--no-confirm-changeset` only for `dev`; `prod` must show the changeset for approval.

## Verification
- `POST {ApiUrl}/auth/login` with Basic credentials -> 200 and `{ token, expiresIn: 3600 }`.
- `GET {ApiUrl}/notes` without a token -> 401.

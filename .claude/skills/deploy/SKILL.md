---
name: deploy
description: Build and deploy the serverless API to AWS with SAM. Use when the user asks to deploy, release, or ship the API.
disable-model-invocation: true
allowed-tools: Bash(npm run typecheck), Bash(sam validate*), Bash(sam build*), Bash(sam deploy*)
---

# Deploy Skill

Deploys the stack defined in `template.yaml`. This changes real AWS resources, so confirm the target
stage with the user before step 4. Parameters and commands are in [deploy-config.md](deploy-config.md).

1. Run `npm run typecheck`; stop and report if it fails.
2. Run `sam validate --lint`; stop and report if the template is invalid.
3. Run `sam build` and confirm esbuild produced the handlers without errors.
4. Ask the user which stage (`dev` or `prod`) to deploy, then run the matching `sam deploy` command from
   `deploy-config.md`. Never print or log secret parameter values (`JwtSecret`, `BasicAuthPassword`).
5. Read the stack outputs (`ApiUrl`, `DataBucketName`) and verify: `POST {ApiUrl}/auth/login` with Basic
   credentials returns a token, and `GET {ApiUrl}/notes` without a token returns 401.
6. Report the API URL and any failures. Do not retry a failed deploy without explaining the cause.

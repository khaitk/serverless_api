---
description: Fix a GitHub issue by number
argument-hint: <issue-number>
---

Fix issue #$ARGUMENTS:
1. Read the issue (GitHub MCP server, see `.mcp.json`).
2. Find the root cause in the affected layer (handler, controller, service, repository).
3. Make the fix following `.claude/rules/`, then run `npm run typecheck`.
4. Summarize what changed and why.

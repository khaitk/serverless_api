---
description: Review the current uncommitted changes
allowed-tools: Bash(git diff:*), Bash(git status:*)
---

Current diff:
!`git diff HEAD`

Review the changes above for logic errors, security issues (auth, input validation, IAM scope),
performance (cold start, S3 calls), and compliance with the rules in `.claude/rules/`.
Report findings as Critical / Warning / Suggestion with `file:line` references.

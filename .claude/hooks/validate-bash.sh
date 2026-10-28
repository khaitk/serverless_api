#!/usr/bin/env bash
# PreToolUse hook: block dangerous Bash commands.
# Receives the tool call as JSON on stdin; exit 2 blocks it and sends stderr back to Claude.

cmd=$(cat | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')

for pattern in 'rm -rf /' 'rm -rf ~' 'git push --force' 'curl .*\| *sh' 'DROP TABLE' 'sam delete' 'aws s3 rb'; do
  if echo "$cmd" | grep -qE "$pattern"; then
    echo "Blocked unsafe command matching: $pattern" >&2
    exit 2
  fi
done

exit 0

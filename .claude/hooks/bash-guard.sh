#!/usr/bin/env bash
#
# PreToolUse guard for the Bash tool. Scope: this script detects and blocks
# exactly one pattern — a command whose output is piped directly into a
# bare shell interpreter (bash/sh/zsh/dash/ksh), optionally via sudo (the
# classic `curl <url> | bash` supply-chain pattern). It does not detect or
# block rm, dd, mkfs, fork bombs, or any other destructive command class —
# see .claude/hooks/README.md for the full, explicit scope statement and
# what those other risks are actually covered by (or not) in this project.
#
# Any command that isn't flagged emits no permission decision at all and
# exits 0, so Claude Code's normal permission rules (allow/ask/deny in
# settings.json) apply completely unchanged.
#
# Fails CLOSED (denies) if: jq is unavailable, stdin isn't valid JSON,
# tool_input.command is missing, grep (or any other dependency) returns an
# unexpected status, or any other unanticipated internal error occurs.
#
# Logging: only DENY and fail-closed events are logged (never ALLOW/safe
# commands), and only as fixed, safe structural facts derived from a closed
# vocabulary of 5 known shell names plus booleans/counts — never as text
# extracted from the untrusted command itself. This is deliberate: the
# command may contain tokens, passwords, API keys, authenticated URLs, or
# unquoted secret values (e.g. `TOKEN=secret cmd`, `curl user:pass@host`),
# and no amount of "redaction" of arbitrary text can be proven safe against
# every such shape. Logging only fixed-vocabulary facts sidesteps the
# problem entirely rather than trying to redact around it.

set -uo pipefail

LOG_FILE="${BASH_GUARD_LOG:-$HOME/.claude/bash-audit.log}"

DENY_NO_JQ='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"bash-guard: jq is not available; failing closed."}}'
DENY_BAD_JSON='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"bash-guard: could not parse hook input JSON; failing closed."}}'
DENY_NO_COMMAND='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"bash-guard: tool_input.command missing; failing closed."}}'
DENY_INTERNAL='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"bash-guard: internal error; failing closed."}}'
DENY_PIPE='{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"bash-guard: command pipes output directly into a shell interpreter (bash/sh/zsh/dash/ksh)."}}'

# log_line's own operations are all defused with "|| true" below, so it can
# never itself raise an uncaught error (safe to call from the ERR trap).
log_line() {
  local outcome="$1" rule="$2" detail="$3"
  mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
  printf '%s\t%s\t%s\t%s\n' "$(date -Iseconds)" "$outcome" "$rule" "$detail" >> "$LOG_FILE" 2>/dev/null || true
}

fail_closed() {
  printf '%s\n' "$1"
  exit 0
}

# Named function (not an inline string) so the trap registration itself
# never embeds a variable containing quote characters — avoids the
# SC2089/SC2090 class of warning entirely rather than just suppressing it.
# ShellCheck's SC2317 ("unreachable") on this function's body is expected
# and is its own documented caveat for functions only called via `trap`
# (see the "or ignore if invoked indirectly" text in that check's message);
# it is genuinely invoked, just not from a call site ShellCheck can see.
on_error() {
  log_line "DENY" "internal-error" "-"
  fail_closed "$DENY_INTERNAL"
}
trap on_error ERR

if ! command -v jq >/dev/null 2>&1; then
  log_line "DENY" "no-jq" "-"
  fail_closed "$DENY_NO_JQ"
fi

raw_input="$(cat)"
if ! printf '%s' "$raw_input" | jq -e . >/dev/null 2>&1; then
  log_line "DENY" "bad-json" "-"
  fail_closed "$DENY_BAD_JSON"
fi

command_text="$(printf '%s' "$raw_input" | jq -r '.tool_input.command // empty')"
if [ -z "$command_text" ]; then
  log_line "DENY" "no-command" "-"
  fail_closed "$DENY_NO_COMMAND"
fi

# Strip quoted substrings and true shell comments before pattern-matching,
# so literal/quoted text (e.g. `echo 'curl url | bash'`) or a comment
# containing the same text isn't mistaken for a real shell operator. A
# comment must be preceded by whitespace or start-of-string, so a bare "#"
# inside an unquoted URL fragment is left alone.
sanitized="$(printf '%s' "$command_text" | sed -e "s/'[^']*'//g" -e 's/"[^"]*"//g')"
sanitized="$(printf '%s' "$sanitized" | sed -E 's/(^|[[:space:]])#.*$//')"

# Protect "||" (logical OR) from being split apart as a pipe.
normalized="${sanitized//||/ OR_OP }"

check_segment_dangerous() {
  # Bare invocation of a shell interpreter (optionally via sudo) as the
  # receiving end of a pipe. grep's own exit codes double as our internal
  # dependency-health check: 0 = match, 1 = no match, 2+ = grep itself
  # failed, which must fail closed, not be treated as "safe."
  printf '%s' "$1" | grep -Eq '^[[:space:]]*(sudo[[:space:]]+)?(bash|sh|zsh|dash|ksh)([[:space:]]|$)'
}

# Extracts only one of the 5 known-safe shell names from a segment already
# confirmed dangerous by check_segment_dangerous — the pattern can only
# ever produce one of those 5 fixed strings, never arbitrary segment text.
extract_shell_name() {
  printf '%s' "$1" | grep -Eo '(bash|sh|zsh|dash|ksh)([[:space:]]|$)' | head -n1 | tr -d '[:space:]'
}

segment_has_sudo() {
  printf '%s' "$1" | grep -Eq '^[[:space:]]*sudo[[:space:]]'
}

matched=0
matched_shell=""
matched_sudo="false"
IFS='|' read -ra segments <<< "$normalized"
segment_count="${#segments[@]}"
if [ "$segment_count" -gt 1 ]; then
  for idx in "${!segments[@]}"; do
    if [ "$idx" -eq 0 ]; then
      continue
    fi
    if check_segment_dangerous "${segments[$idx]}"; then
      matched=1
      matched_shell="$(extract_shell_name "${segments[$idx]}")"
      if segment_has_sudo "${segments[$idx]}"; then
        matched_sudo="true"
      fi
    else
      rc=$?
      if [ "$rc" -ge 2 ]; then
        log_line "DENY" "internal-error" "-"
        fail_closed "$DENY_INTERNAL"
      fi
    fi
  done
fi

if [ "$matched" -eq 1 ]; then
  log_line "DENY" "pipe-to-shell" "segments=${segment_count} shell=${matched_shell} sudo=${matched_sudo}"
  fail_closed "$DENY_PIPE"
fi

exit 0

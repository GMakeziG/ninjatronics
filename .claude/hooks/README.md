# `.claude/hooks/bash-guard.sh`

A `PreToolUse` hook for the `Bash` tool, wired from `.claude/settings.json`.

## Exact scope — read this before assuming it protects more than it does

**This hook detects and blocks exactly one pattern: a command whose output is
piped directly into a bare shell interpreter** (`bash`, `sh`, `zsh`, `dash`,
`ksh`), optionally via `sudo` — the classic `curl <url> | bash` /
`wget <url> | sh` supply-chain pattern.

**It does not detect or block:**
- `rm`, `dd`, `mkfs`, or any other destructive/data-loss command
- fork bombs (e.g. `:(){ :|:& };:`)
- code execution via any mechanism other than a literal pipe into a shell
  name (e.g. `curl url -o /tmp/x && bash /tmp/x` is a *different* pattern —
  download-then-execute rather than pipe-then-execute — and is **not**
  matched by this hook)
- anything expressed through `python -c`, `perl -e`, `node -e`, `osascript`,
  or any other interpreter besides the five shell names above

If you're relying on this hook for protection against any of the above, it
provides none. Do not describe it, in documentation or commit messages, as
general command-safety tooling — it is a narrow, single-purpose guard.

## `rm` protection lives in `settings.json`, not here — and it's partial

`.claude/settings.json`'s `permissions.deny` list includes three literal
patterns:

```
Bash(rm -rf /*)
Bash(rm -rf ~*)
Bash(rm -rf .)
```

This is **intentionally narrow**, not a general `rm` safety net, and it does
**not** cover equivalent-but-differently-phrased invocations such as:

- `rm -r -f /` (separate short flags instead of the combined `-rf`)
- `rm -rf --no-preserve-root /` (an extra flag inserted before the path)
- `rm --recursive --force /` (long-form flag names)

Claude Code's Bash permission matching is a literal string-prefix/wildcard
match against the raw command text (see the project's permissions
documentation) — it is not a semantic understanding of what `rm` was asked
to do. Each of the three variants above is a different literal string and
therefore does not match any of the three deny patterns above.

**What actually protects against those bypass forms:** nothing in `allow` or
`deny` mentions bare `rm` at all, so *every* `rm` invocation that isn't one
of the three exact literal denies — including all three bypass forms above —
falls through to Claude Code's **default ask-before-run behavior**. The
three explicit `deny` entries are strictly *more* restrictive than that
default: they make those three specific literal phrasings impossible to run
even with an in-the-moment human approval (deny always wins over allow/ask),
whereas every other `rm` invocation still requires — and gets — a human
confirmation prompt, same as before this change. The gap is real (a
differently-phrased destructive `rm` isn't hard-blocked), but it is not
*unprotected* — it is protected by the same default confirmation gate that
covered all `rm` usage prior to this change.

## Logging

Only `DENY` and fail-closed events are logged, to `~/.claude/bash-audit.log`
by default (override with `BASH_GUARD_LOG`). `ALLOW`/safe commands are never
logged. Log lines never contain text extracted from the command itself —
only fixed, closed-vocabulary structural facts (pipe segment count, which of
the 5 known shell names matched, whether `sudo` was involved). This is
deliberate: the command may contain tokens, passwords, API keys, or
credential-bearing URLs, and no redaction scheme over arbitrary text can be
proven safe against every shape that could take. Logging only fixed facts
sidesteps the problem rather than trying to redact around it — see
`bash-guard.test.sh` cases 15–19 for the tests proving this.

## Running the tests

```
bash .claude/hooks/bash-guard.test.sh
```

Re-run after any edit to `bash-guard.sh`.

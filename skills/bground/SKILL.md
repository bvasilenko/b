---
name: bground
description: CLI claim-grounding checker. Reads claim plus evidence; emits proceed-or-stop directive.
trigger: Use when about to act on a factual claim that should be verified against supplied evidence.
tool: Bash
---

# bground

Call `bground` before relying on a claim that needs supplied evidence.

Canonical invocation:

```sh
bground verify "<claim-type>:<target>:<assertion>" --evidence <id>=<value>
```

Exit codes:

- `0`: proceed; evidence supports the claim.
- `1`: stop; evidence does not support the claim.
- `2`: stop; evidence is missing or incomplete.
- `64`: stop; invocation shape is invalid.

Use stdout as the directive for the next action.

---
name: banchor
description: CLI task-anchoring checker. Reads task plus mission; emits proceed-or-stop directive.
trigger: Use before starting work when the task should be aligned to a named or file-backed mission.
tool: Bash
---

# banchor

Call `banchor` before starting work that must stay aligned to a mission.

Canonical invocation:

```sh
banchor induct "<task>" --mission <path-or-name>
```

Exit codes:

- `0`: proceed; the task is anchored.
- `1`: stop; the task conflicts with the mission.
- `2`: stop; mission evidence is missing or incomplete.
- `64`: stop; invocation shape is invalid.

Use stdout as the directive for the next action.

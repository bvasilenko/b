<!-- BSUITE_BINDINGS:BEGIN -->
## b-* command-line tool bindings

Use these binaries when the current task needs agent-side verification before action.

### bground

Use `bground` when a factual claim should be checked against supplied evidence.

```sh
bground verify "<claim-type>:<target>:<assertion>" --evidence <id>=<value>
```

Exit codes: `0` proceed, `1` stop because evidence does not support the claim, `2` stop because evidence is missing or incomplete, `64` stop because invocation shape is invalid. Treat stdout as the directive for the next action.

### banchor

Use `banchor` before starting work that must stay aligned to a mission.

```sh
banchor induct "<task>" --mission <path-or-name>
```

Exit codes: `0` proceed, `1` stop because the task conflicts with the mission, `2` stop because mission evidence is missing or incomplete, `64` stop because invocation shape is invalid. Treat stdout as the directive for the next action.
<!-- BSUITE_BINDINGS:END -->

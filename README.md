# b

Discipline runtime for your AI coding agent, installed in one line. After `npm install -D @booga/b`, every Claude Code session, Codex run, or Cursor pass picks up 6 small tools that fire transparently: bground verifies factual claims; banchor checks task drift; bsmell flags deflection patterns (mock-instead-of-fix etc.); bratch catches regression-signature changes; bwatch consults outward trackers; bspector scans new tools before install. Verdicts return as directives the agent acts on: no operator intervention. The capability shape is closed; the prompt library that powers each verdict evolves continuously via empirical-lift evaluation.


Entry point for the b-* prompt lookup tools. Installs the tools, registers each as a Claude Code skill, Codex AGENTS template, or Cursor rule so the agent loop discovers and invokes them, and updates installed tools on demand.

## One-line install

```sh
npm install -D @booga/b
```

That single line:

- Pulls `b` plus the 6 prompt lookup tools (bground, banchor, bsmell, bratch, bwatch, bspector) onto your machine.
- Auto-registers all 6 with every supported substrate by default: Claude Code, Codex, and Cursor.
- Scope is project-local for a project install (writes to `<project>/.claude/skills/`, `<project>/AGENTS.md`, `<project>/.cursor/rules/`).
- Scope is user-wide for a global install (`npm install -g @booga/b`).

## Opt-out

- Skip the auto-register step entirely: set `B_SKIP_AUTO_INSTALL=1` before `npm install`.
- Skip specific substrates: set `B_SKIP_TARGETS=cursor,codex` before `npm install`.

You can still run the install CLI by hand later:

```sh
b install --target=claude
b install --target=codex
b install --target=cursor
b uninstall --target=claude
```

## Tools

Shipped:

- [bGround](https://github.com/bvasilenko/bGround) - prompt lookup for claim grounding
- [bAnchor](https://github.com/bvasilenko/bAnchor) - prompt lookup for task-to-mission anchoring
- [bSmell](https://github.com/bvasilenko/bSmell) - prompt lookup for deflection-pattern smells
- [bRatch](https://github.com/bvasilenko/bRatch) - prompt lookup for regression-signature checks
- [bWatch](https://github.com/bvasilenko/bWatch) - prompt lookup for external-tracker findings
- [bSpector](https://github.com/bvasilenko/bSpector) - prompt lookup for vulnerability patterns in agent skill bundles

Shared dependency:

- [bCore](https://github.com/bvasilenko/bCore) - types and helpers linked at build time by every tool above

## License

MIT.

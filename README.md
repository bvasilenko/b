# b

Entry point for the b-* prompt lookup tools. Installs the tools, registers each as a Claude Code skill, Codex AGENTS template, or Cursor rule so the agent loop discovers and invokes them, and updates installed tools on demand.

## Install

```sh
npm install -D @booga/b
```

## Use

```sh
b install --target=claude
b install --target=codex
b install --target=cursor
b uninstall --target=claude
```

## Tools

Shipped:

- [bGround](https://github.com/bvasilenko/bGround) — prompt lookup for claim grounding
- [bAnchor](https://github.com/bvasilenko/bAnchor) — prompt lookup for task-to-mission anchoring
- [bSmell](https://github.com/bvasilenko/bSmell) — prompt lookup for deflection-pattern smells

Pending:

- bRatch — prompt lookup for regression-signature checks
- bWatch — prompt lookup for external-tracker findings
- bSpector — prompt lookup for vulnerability patterns in agent skill bundles

Shared dependency:

- [bCore](https://github.com/bvasilenko/bCore) — types and helpers linked at build time by every tool above

## License

MIT.

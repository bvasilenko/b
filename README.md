# bsuite-bindings

Agent-substrate binding for the b-* command-line tools. Installs Claude Code skills, Codex AGENTS template, and Cursor rules so autonomous LLM-agent loops discover and invoke the binaries automatically.

bsuite-bindings makes the b-* binaries reachable from inside an LLM-agent loop without operator-authored system-prompt glue. It installs target-native instruction files that tell the agent when to call `bground` and `banchor`, how to pass inputs, and how to interpret exit codes.

## Command surface

```sh
bsuite-bindings install --target=<claude|codex|cursor>
```

## Install

```sh
npm install -D @booga/bsuite-bindings
```

## Use

Install Claude Code skills into the current project:

```sh
bsuite-bindings install --target=claude --scope=project
```

Preview a Codex AGENTS.md update without writing files:

```sh
bsuite-bindings install --target=codex --scope=project --dry-run
```

Install Cursor rule files into a custom project directory:

```sh
bsuite-bindings install --target=cursor --dest ./my-project/.cursor/rules
```

Remove managed Codex content while preserving the rest of AGENTS.md:

```sh
bsuite-bindings uninstall --target=codex --scope=project
```

Select a subset of supported binaries:

```sh
bsuite-bindings install --target=claude --tools=bground,banchor
```

## License

MIT

---
title: The CLI
description: orrin new scaffolds a project; orrin run builds the scripts, indexes the assets and launches the engine.
order: 2
---

The `orrin` binary lives in the `orrin-cli` crate. Build it once from the engine
workspace:

```bash
cargo build -p orrin-cli
```

The binary lands at `./target/debug/orrin`.

## `orrin new`

```bash
./target/debug/orrin new my-game
```

Scaffolds a new project directory containing:

- the project **manifest**,
- a **`.csproj`** for the C# side,
- an entry **`Behaviour`** to attach your first script to.

The point of `new` is that you don't have to learn the workspace layout, the
feature flags, or the CoreCLR wiring before you write your first line of game
code.

## `orrin run`

```bash
cd my-game
../target/debug/orrin run
```

`run` does three things in order:

1. **Builds the scripts** — compiles the project's C# assembly.
2. **Indexes the assets** — walks the project tree and registers what it finds.
3. **Launches the engine** on your project rather than the built-in demo.

## Reference

The crate keeps its own README alongside the source:
[`crates/orrin-cli/README.md`](https://github.com/Orrin-Team/orrin/blob/master/crates/orrin-cli/README.md).

> This page documents the commands as they exist on `master` today. Project
> structure and manifest format are still moving — the scene format
> specification is [issue #41](https://github.com/Orrin-Team/orrin/issues/41),
> in Phase 3.

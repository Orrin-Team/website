---
title: Getting started
description: Build Orrin from source, run the built-in demo, and scaffold your first project with the CLI.
order: 1
---

Orrin builds from source. There is no installer and no published binary release
yet — the engine is pre-release, and the way you run it today is the way the
team runs it.

## Prerequisites

- **Rust** — a recent stable toolchain, installed via [rustup](https://rustup.rs).
- **A Vulkan-capable GPU and driver.** The renderer targets Vulkan through
  [vulkano](https://github.com/vulkano-rs/vulkano).
- **The .NET SDK** — only if you want C# scripting. The engine runs without it.

## Clone and run the demo

```bash
git clone https://github.com/Orrin-Team/orrin.git
cd orrin
cargo run -p orrin-core
```

That builds the workspace and starts the engine on its built-in demo scene. The
first build compiles the whole dependency tree, so expect it to take a while;
subsequent runs are incremental.

## Run with C# scripting

Scripting is behind a Cargo feature. Build the C# side first, then enable the
feature:

```bash
dotnet build scripting/Orrin -c Debug
cargo run -p orrin-core --features scripting
```

The C# runtime is hosted in-process through CoreCLR, which is what makes it
possible to reload game code without restarting the editor.

## Start a game project

You don't need to know any of the above to make a game. The `orrin` CLI
scaffolds and runs projects for you:

```bash
cargo build -p orrin-cli

./target/debug/orrin new my-game
cd my-game
../target/debug/orrin run
```

`orrin new` writes the project manifest, a `.csproj`, and an entry `Behaviour`.
`orrin run` builds the scripts, indexes the assets, and launches the engine on
your project.

## Where to go next

- [The CLI](/docs/cli/) — what `new` and `run` actually do.
- [Scripting](/docs/scripting/) — the C# side and hot reload.
- [Architecture](/docs/architecture/) — the long-term plan and why the early
  decisions look the way they do.

## If something breaks

Orrin is in active development and the surface changes. The
[Discord](https://discord.gg/sY8YBGFmRy) is the fastest way to get an answer,
and [the issue tracker](https://github.com/Orrin-Team/orrin/issues) shows what's
already known.

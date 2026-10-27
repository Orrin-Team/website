---
title: Getting started
description: Understand how to get set up with Orrin.
order: 1
---

As there is no release for Orrin, you need to clone or fork the repo and build it yourself.

## Prerequisites

- **Rust** - Orrin is written in Rust; you need to install it via [rustup](https://rustup.rs).
- **A Vulkan-capable GPU and driver.** Orrin's renderer runs on Vulkan via
  [vulkano](https://github.com/vulkano-rs/vulkano).
- **The .NET SDK** - you need .NET if you want to script on this engine. Get it here: [.NET](https://dotnet.microsoft.com/en-us/download).

## Clone and run the demo

```bash
git clone https://github.com/Orrin-Team/orrin.git
cd orrin
cargo run -p orrin-core --release
```

This clones and builds Orrin. I highly recommend running Orrin with `--release` or else you will get poor performance. Building this project will take a couple of minutes for its first time.

## Start a game project

If you want to build a new Orrin project you need to use the Orrin CLI:

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

- [The CLI](/docs/cli/) - get to know the CLI better.
- [C# API reference](/docs/api-reference/) - explore the C# API.

## If something breaks

Orrin is in active development and the surface changes. The
[Discord](https://discord.gg/sY8YBGFmRy) is the fastest way to get an answer,
or [GitHub issues](https://github.com/Orrin-Team/orrin/issues) is another way to report bugs.

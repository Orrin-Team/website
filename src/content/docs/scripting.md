---
title: Scripting
description: C# hosted in-process through CoreCLR, with hot reload as a hard constraint rather than a convenience.
order: 3
---

Game code in Orrin is C#. The runtime is hosted **in-process** through CoreCLR
rather than shelling out to a separate process, which is what makes it possible
to swap game assemblies while the engine keeps running.

## Enabling it

Scripting sits behind a Cargo feature so an engine build that doesn't need it
doesn't pay for it:

```bash
dotnet build scripting/Orrin -c Debug
cargo run -p orrin-core --features scripting
```

If you're working inside a project created by `orrin new`, the CLI handles this
for you — `orrin run` builds the scripts before it launches.

## What landed in Phase 1

The scripting foundation is the part of the engine with the most closed work
behind it:

- **Improved scripting integration** — [#4](https://github.com/Orrin-Team/orrin/issues/4)
- **C# core math library** — [#9](https://github.com/Orrin-Team/orrin/issues/9)
- **Time API** — [#10](https://github.com/Orrin-Team/orrin/issues/10)
- **Extended script lifecycle** — [#11](https://github.com/Orrin-Team/orrin/issues/11)
- **Entity querying from C#** — [#12](https://github.com/Orrin-Team/orrin/issues/12)
- **Script error isolation** — [#14](https://github.com/Orrin-Team/orrin/issues/14)
- **Debug utilities** — [#15](https://github.com/Orrin-Team/orrin/issues/15)

Error isolation matters more than it sounds: a misbehaving script — and later, a
misbehaving package — logs and disables itself instead of taking the editor down
with it.

## Hot reload

Hot reload arrived in Phase 2, alongside external game assemblies
([#5](https://github.com/Orrin-Team/orrin/issues/5)) and the build watcher
([#18](https://github.com/Orrin-Team/orrin/issues/18)).

The architecture plan treats this as an invariant rather than a feature:
anything that requires an editor restart on a script change counts as a
regression, and the same expectation applies to shader edits and asset edits.

## Components and the registry

Scripted components participate in the engine's component registry through a
small interop shim that exposes their fields as typed property bags. The
practical consequence is that C# components get saving, inspection and — later —
collaborative sync without being second-class next to Rust ones.

The registry itself is [issue #39](https://github.com/Orrin-Team/orrin/issues/39).

## Reference documentation

A full C# API reference and contributor guide is
[issue #31](https://github.com/Orrin-Team/orrin/issues/31), scheduled for
Phase 5. Until it lands, the C# sources under `scripting/Orrin` and the
`examples/hello-orrin` project are the reference.

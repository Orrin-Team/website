---
title: Architecture
description: Plain-data components, stable UUIDs, one mutation pipeline, a data-driven render graph — the early disciplines the later features depend on.
order: 4
---

Orrin keeps a written architecture plan in the repository at
[`docs/architecture.md`](https://github.com/Orrin-Team/orrin/blob/master/docs/architecture.md).
It's the canonical version and it's worth reading in full. This page is a map of
what's in it.

## The premise

Unity and Unreal are capable engines with a shared blind spot: they optimise the
moment of creation and neglect the daily grind of iterating, collaborating and
owning your work. The plan names six specific failures it's aiming at —
iteration speed, version control and collaboration, renderer opacity, dependency
management, ownership, and diagnostics — and every later decision is justified
against that list.

## Plain data, not pointers

The ECS is the canonical representation of everything: game entities, editor
state, and eventually render passes. Components are plain serializable data and
systems own all behaviour. **No component may hold a raw pointer or a direct
reference to another entity or asset** — only an `EntityId` or `AssetId` handle.

That single rule is what makes scenes serializable, diffable, syncable over a
network and safe to hot-reload. Break it once and three flagship features
quietly become impossible.

## Two ID spaces

`EntityId` identifies an entity across sessions, machines and collaborators;
`AssetId` identifies an asset independent of its file path. Both are 128-bit
UUIDs, assigned at creation and never reused. The ECS still uses dense
generational indices internally for iteration speed — hot loops speak indices,
serialization and networking speak UUIDs.

## The component registry

Every component type registers once: how to serialize it, how to diff two
instances, how to apply a diff, how to draw its inspector, and its default
value. Scene save/load, undo/redo, the inspector, prefab overrides and later the
collaboration protocol are all derived from that one registration.

The plan calls this the highest-leverage piece of infrastructure in the engine.

## The render graph

The current pipeline — forward+, MSAA, SSAO, HDR tonemap — is to be restructured
into an explicit render graph *before* shadows multiply the pass count.
Migrating five passes is a contained refactor; migrating fifteen is surgery.

The motivation isn't mainly performance. A graph makes the renderer
**inspectable** (pass DAG, per-pass GPU timings, intermediate textures on
click), **extensible** (a user pass is a node registration), and **replaceable**
(path tracing becomes an alternative subgraph rather than a second renderer).

## A reference path tracer, early and slow

Well before real-time ray tracing is attempted, the plan calls for an offline
reference path tracer as an editor mode: brute force, unbiased, seconds per
frame. It earns its place three ways — as a correctness oracle for every raster
feature, as the infrastructure real-time path tracing will need later, and as a
showcase feature neither Unity nor Unreal offers.

## Collaboration, later

Structured scene data becomes a CRDT document; binary assets get checkout locks,
because pretending textures merge is a research trap. None of it is implemented
in Phases 1–5. The only thing the early phases owe it is that **all scene
mutation routes through a single command and diff API** — which undo/redo needs
anyway.

## Assets and packages

Source files belong to you and to git; the engine imports them into compiled
artifacts in a content-addressed local cache keyed by source bytes, importer
version and import settings. Packages are versioned collections of assets plus
optional C# code, resolved like Cargo dependencies with a committed lockfile and
self-hostable registries.

## Sequencing

Phases 1–5 are the showcase roadmap. Phase 6 (first half of 2027) brings the
render graph inspector and the reference path tracer; Phase 7 the package
manager and registry; Phase 8 the CRDT scene document and collaboration server;
Phase 9 real-time path tracing.

See the [roadmap](/roadmap/) for the phase-by-phase state, including which
issues are already closed.

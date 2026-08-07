---
title: Why Orrin exists
description: Unity and Unreal are capable engines with a shared blind spot. This is the six-item list Orrin is aiming at, and what each one costs to get right early.
date: 2026-08-06
author: Alternative
draft: false
---

<!--
  STARTER POST. Assembled from the project's own README and
  docs/architecture.md so the blog ships with something real in it rather than
  lorem ipsum. Every claim here traces back to one of those two files — but
  read it in your own voice before you leave it up, and change the date and
  author to match when you actually publish.
-->

I've decided to dedicate a lot of my time into this project to solve a lot of the downfalls of the big game engines most developers use. I do understand that it's mear impossible feat to even try compete with theese engines. But nevertheless I still want to deliver something unique and actually impactful to the game development scene.

From my 7 years of game development with all kinds of game engines like: Godot, Unity, Unreal and Roblox Studio I had many frustrations using them. In late June I decided to expirement with making a quick little game engine. I became obssessed with doing so, learning many new skills along the way. This sparked something in me that I should take this seriously and tackle all the issues I feel is the worst with thoose game engines.

I feel like showing and telling people what the main problems with game engines is important. I've had many discussions with developers of all kind, which gave me a good insight of what truly needs to be added to game engines or improved on to make them great.

## 0. Fit for purpose
All the mainstream game engines, like unreal or unity force bloat or features you don't actually need for your game. This slows down development time and the actually games themselves. Teams that decide to make their own game engine get slowed down by spending time and resources creating a whole game engine from scratch.

Orrin is built to be modular allowing you to select the parts of the game engine you actually need for you game. This is also serves as a great tool for developers that make their own game engine for their games. Fork or use the built in project manager to create your own game engine for the specific game.

## 1. Iteration speed

Unreal's compile-and-restart loop and Unity's domain-reload stalls are the
most-complained-about aspects of both engines. Orrin treats "change code, see
the result in under two seconds" as a hard constraint that every subsystem has
to respect — game code, shaders, and assets alike.

Anything that requires an editor restart on a script change counts as a
regression, not a rough edge.

Orrin also aims to be fast in every single part of the workflow, from loading
scenes to doing mass changes. Everything should feel seamless. It's fruststrating
for developers having to wait for their actions to actually do something.

## 2. Version control and collaboration

Unity scenes produce constant merge conflicts. Unreal's answer is binary files
plus Perforce plus exclusive locking. Neither engine can put two people in the
same scene at the same time.

Orrin treats the scene as a mergeable, diffable, concurrently editable document
from the start. Scenes serialize to a line-oriented, deterministic text format —
one entity per block, components sorted by type, fields sorted by name, floats
printed canonically. Identical scenes produce byte-identical files, so git diffs
mean something.

## 3. Renderer opacity

Unity's SRP is hard to see into, and Unreal's renderer is a monolith in
practice. Debugging a slow or wrong frame means external tools and guesswork.

Orrin's render graph is data: inspectable in the editor, profiled per pass, and
extensible by registering nodes instead of forking the engine. A side effect of
deriving barriers from declarations is that the worst Vulkan bug class stops
being writable at all.

## 4. Dependency management

Unity's package manager is shallow and its asset store has no dependency
resolution. Unreal's plugin ecosystem has none either. There's currently no good
answer to "I want to share a gameplay system, with its assets, versioned and
self-hostable."

The short description of the fix is *Cargo, for game content*: a manifest, a
committed lockfile, semver ranges, transitive resolution, and registries that
are deliberately boring static services anyone can host.

Orrin allows you to upload, plugins, code libraries and assets to orrin's
asset manager for the public or you can self host the service for your own
team. Plugins allow you to create tools for the editor. Code libraries allow
you to import useful modules, dependices etc. And assets give you access to models, sounds and everything else.

## 5. Ownership

Licensing changes, runtime fees, closed editors. Orrin's position is full source
including the editor, and **no subsystem may ever depend on a service that only
Orrin-the-organisation can run.**

Anything networked — the collaboration server, the registry, the build cache —
must be self-hostable, with paid hosting as a convenience on top. The hosted
version must never do anything the self-hosted one can't, because the first time
it does, the ownership pitch is dead.

## 6. Diagnostics

GPU device losses with no explanation. Shaders that silently render black.
Assets that fail to import without saying why.

Orrin borrows the Rust compiler's attitude: a failure names the entity, asset,
or pass involved and suggests a likely fix. Cheap to build early, nearly
impossible to retrofit.

## Conclusion
So theese are the **main** reasons and not all of the reasons
why I think people should try out or even choose orrin
over the mainstream game engines. I'll be consistently trying to update Orrin even through school and work.

If you have any suggestions or you even want to discuss or potentially contribute, I highly advice you joing the discord server. I am super active there but github issues are also another spot where you can reach me.
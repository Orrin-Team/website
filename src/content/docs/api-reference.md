---
title: C# API reference
description: All C# API types and references go here.
order: 3
---

<!-- GENERATED FILE — DO NOT EDIT.
     Produced by scripts/gen-api-docs.mjs from the doc comments in
     Orrin-Team/orrin:scripting/Orrin. To change anything on this page,
     change the `///` comment in the engine source and run `npm run api:docs`.
-->

Generated from the `Orrin` scripting assembly at commit `c6b7f38`. Every
entry below is the engine's own doc comment — if something here is wrong or
missing, the fix belongs in the C# source, not on this page.

## Types

- [`Asset`](#asset) — The kinds of asset an [AssetRef] can name. Closed: an asset type is added here and on the engine side together.
- [`AssetKinds`](#assetkinds) — What the engine's `find_asset` reports. Lock-step with `ASSET_*` in orrin-script: append, never renumber.
- [`AssetRef<T>`](#assetreft) — A reference to an asset by its id: what a Behaviour field, a scene and a prefab store, and never a path. The id lives in the sidecar beside the asset's file, so moving or renaming the file keeps every reference to it.
- [`AssetState`](#assetstate) — Whether what an asset reference draws is the asset yet. Lock-step with `LOAD_*` in orrin-script: append, never renumber.
- [`Behaviour`](#behaviour) — Keep constructors pure — no logging, no registration, no engine calls. The engine builds a throwaway instance of each Behaviour type during a hot reload to read its field defaults, so a constructor with side effects fires more often than the lifecycle below suggests. `Entity` is not assigned yet at construction either; do setup in OnStart.
- [`Behaviours`](#behaviours) — Lifecycle of a Behaviour, in dispatch order:
- [`BehaviourState`](#behaviourstate) — Behaviour field state carried across a hot reload.
- [`BehaviourState.EnumValue`](#behaviourstateenumvalue) — An enum captured structurally: the boxed enum itself would be a game-assembly instance and would pin the load context.
- [`BoxCollider`](#boxcollider)
- [`Collider`](#collider) — Shape descriptor for World.AddCollider. Dimensions are local-space and get scaled by the entity's transform scale engine-side.
- [`Collision`](#collision)
- [`Color`](#color) — An RGBA color with float components, nominally in [0, 1] (values above 1 are meaningful for HDR/emissive use and are not clamped).
- [`ComponentAttribute`](#componentattribute) — Gives a Behaviour a stable identity in the component registry, so its fields are saved with the scene, shown in the inspector, and carried across a hot reload.
- [`ComponentKinds`](#componentkinds)
- [`Debug`](#debug) — Developer-facing debug output: structured logging that surfaces in the editor console, and immediate-mode line drawing rendered as a scene overlay.
- [`Entity`](#entity)
- [`GameLoadContext`](#gameloadcontext) — The collectible load context a project's game assembly lives in.
- [`Input`](#input)
- [`LogLevel`](#loglevel) — Severity of a log line, quietest first.
- [`Material`](#material) — A `.fmat` file under the project's assets directory, or a material the engine builds, which is always ready.
- [`Mathf`](#mathf) — Float math helpers for gameplay code. Angles at this API surface are in degrees unless a name says otherwise; use `Mathf.Deg2Rad` / `Mathf.Rad2Deg` at the boundary with radian-based math.
- [`Mesh`](#mesh) — A glTF 2.0 file under the project's assets directory, imported as one mesh.
- [`Prefab`](#prefab) — An entity tree saved as a `.fprefab` file under the project's assets directory, instantiated whole.
- [`PropertyBag`](#propertybag)
- [`PropertyBag.Tag`](#propertybagtag) — Lock-step with `wire::tag` in orrin-registry.
- [`PropertyBag.Writer`](#propertybagwriter) — Grows by doubling and copies out once, so an entry point never has to guess a size and the caller never sees a partial buffer.
- [`Quaternion`](#quaternion) — A rotation, stored as x/y/z/w (vector part, then scalar — the same layout as the Rust side's `[f32; 4]` in `CTransform`, so the field order must not change).
- [`SphereCollider`](#spherecollider)
- [`Tag`](#tag) — A queryable gameplay label; mirrors the Rust `Tag` component. Fetched by value — mutating a copy does not write back; assign via World.SetTag.
- [`Texture`](#texture) — A PNG or JPEG under the project's assets directory.
- [`Time`](#time) — Frame timing, read live from the engine's Time resource.
- [`TransientAttribute`](#transientattribute) — Marks a Behaviour field or property as *not* worth preserving across a hot reload: a cache, a handle re-acquired in OnStart, anything derivable.
- [`Vector2`](#vector2) — A 2D vector of floats. Immutable; operations return new values.
- [`Vector3`](#vector3) — A 3D vector of floats. Immutable; operations return new values.
- [`Vector4`](#vector4) — A 4D vector of floats. Immutable; operations return new values.
- [`World`](#world)

---

## Asset

The kinds of asset an [AssetRef] can name. Closed: an asset type is added
here and on the engine side together.

_No documented members._

---

## AssetKinds

What the engine's `find_asset` reports. Lock-step with `ASSET_*` in
orrin-script: append, never renumber.

_No documented members._

---

## AssetRef\<T\>

A reference to an asset by its id: what a Behaviour field, a scene and a
prefab store, and never a path. The id lives in the sidecar beside the
asset's file, so moving or renaming the file keeps every reference to it.

`default` is the null reference, the value of a field nothing assigned.
Assign one in the inspector by dropping an asset onto the field, or in tools
with [Assets.Find].

### `IsValid`

<span class="api-kind">property</span>

False for the null reference. Says nothing about whether the asset still
exists; [State] does.

### `State`

<span class="api-kind">property</span>

Whether the asset is drawable yet. A missing or broken asset is
`Failed` rather than an exception: it draws as a placeholder, and the
engine has already logged its name.

### `ToString()`

<span class="api-kind">method</span>

The id in canonical form, as the scene file spells it.

---

## AssetState

Whether what an asset reference draws is the asset yet. Lock-step with
`LOAD_*` in orrin-script: append, never renumber.

### `Failed`

<span class="api-kind">field</span>

Missing or broken. A placeholder draws in its place, and the engine has
logged an error naming the asset.

### `Loading`

<span class="api-kind">field</span>

Importing; a placeholder draws in its place until it is ready.

---

## Behaviour

Keep constructors pure — no logging, no registration, no engine calls. The
engine builds a throwaway instance of each Behaviour type during a hot
reload to read its field defaults, so a constructor with side effects fires
more often than the lifecycle below suggests. `Entity` is not assigned yet
at construction either; do setup in OnStart.

### `Active`

<span class="api-kind">field</span>

Whether the behaviour is currently active, as last dispatched by the
engine. Owned here (not only in Rust) so the destroy path can decide
whether OnDisable is still owed without a round-trip.

### `LocalTransform`

<span class="api-kind">property</span>

This entity's transform relative to its parent. For an entity with no
parent it is also its world transform.

Named for the space it is in, because once an entity can have a parent
"the transform" is ambiguous and the two disagree silently.

### `Parent`

<span class="api-kind">property</span>

This entity's parent, or `Entity.Null` if it is a root.

### `WorldTransform`

<span class="api-kind">property</span>

This entity's transform in world space, whatever it is parented to.

Setting it composes with the inverse of the parent's transform, so an
object can be placed in the world without a script knowing whether it
has a parent. The scale that comes back is a best fit — see
[Native.GetWorldTransform].

### `OnCollisionEnter(Collision)`

<span class="api-kind">method</span>

Fired the first frame this entity's collider overlaps another; the
engine dispatches collision callbacks before OnUpdate each tick.

### `OnCollisionExit(Collision)`

<span class="api-kind">method</span>

Fired the first frame a previously-overlapping pair separates. The
payload carries the *last known* contact — there is no contact this
frame by definition.

### `SetParent(Entity, bool)`

<span class="api-kind">method</span>

Attach this entity to `parent`, or pass `Entity.Null` to detach it.

Returns false and changes nothing if the move would create a cycle. The
change is structural, so it lands after this tick's dispatch — `Parent`
still reads the old value until the next frame.

---

## Behaviours

Lifecycle of a Behaviour, in dispatch order:

1. ctor + Entity assignment   — `Create`, when the engine attaches the script
2. OnEnable                   — first activation, and every re-activation
3. OnStart                    — once, on the first tick the behaviour is active
4. OnUpdate                   — every tick while active
5. OnDisable                  — every deactivation; also fired by `Destroy`
if the behaviour is still active
6. OnDestroy                  — once, just before the GCHandle is freed
7. GCHandle.Free              — last step of `Destroy`; the object is
unreachable from Rust after this

Steps 2–5 can cycle (enable/disable). `Destroy` is the only path that frees
the handle, so OnDestroy always precedes the free by construction.

### `Destroy(ulong)`

<span class="api-kind">method</span>

Tears the behaviour down and frees its GCHandle. This is the single
managed release point: Rust's `ScriptComponent::drop` lands here.

### `Fault(Behaviour, string, Exception)`

<span class="api-kind">method</span>

Log a contained script exception with the script's type, the hook that
threw, and the exception (type + message + stack trace), then report the
fault so the caller stops dispatching to this behaviour.

An error, attributed to the Behaviour rather than to this file: it is
the script's line in the console, and the one an export's log file is
there to keep.

### `ResolveType(string)`

<span class="api-kind">method</span>

Resolve an assembly-qualified Behaviour name (`MyGame.Player, MyGame`).

The game assembly is searched first and by hand, because `Type.GetType`
resolves through the *default* ALC: handed `MyGame.Player, MyGame` it
would load a second copy of the game assembly into the uncollectible
context, which pins those types for the life of the process and quietly
defeats hot reload. Only the fallback, for engine-owned types such as
the lifecycle probes, may go through the default ALC.

---

## BehaviourState

Behaviour field state carried across a hot reload.

The engine drives this around the assembly swap: `Capture` once per live
Behaviour before its GCHandle is freed, the swap, `Apply` once per re-created
Behaviour before OnEnable, then `Discard` for whatever went unclaimed because
its type was renamed or deleted between builds.

**A snapshot outlives the assembly it came from, so nothing reachable from
this class may reference a type declared in the game assembly** — not a
captured value, not a dictionary key. One boxed game enum or cached `Type` is
a live reference into the collectible context, and `GameAssembly.Commit` then
reports a leak that never resolves for the rest of the session. That is why
the capturable set is closed rather than "whatever reflection hands back",
and it is the constraint the component registry (issue #39) inherits when it
replaces `TryCapture`/`TryApply` with vtables.

No entry point may throw — a managed exception unwinding into native frames
is undefined behaviour. Diagnostics go to `Console.Error`, and Rust logs the
reload summary to the editor console itself.

### `_nextId`

<span class="api-kind">field</span>

Ids are opaque to Rust and never reused within a session; 0 is reserved
for "no snapshot".

### `Bindings`

<span class="api-kind">field</span>

The assembly this file is compiled into. A type from here is safe to
box into a snapshot; a type from anywhere else is not.

### `Defaults`

<span class="api-kind">field</span>

Constructor values per type, for the deviation check in `Capture`.

Keyed by type *name*, never by `Type`. A `Type` object is a live
reference into the load context that declared it, exactly like a boxed
game enum is — caching one here pins the outgoing assembly through
`GameAssembly.Commit`, which runs before `Discard` gets a chance to
clear this.

Cleared per reload anyway, for an unrelated reason: after a swap the same
name denotes a freshly compiled type whose defaults are the ones the
author just edited.

A null value caches "defaults unavailable" so a throwing constructor is
only hit once per reload.

### `Snapshots`

<span class="api-kind">field</span>

Snapshots by id. Lives in the default ALC, and by the rule above holds
only default-ALC values, so it can outlive the game assembly.

### `Apply(ulong, ulong)`

<span class="api-kind">method</span>

Restore snapshot `id` onto the freshly created behaviour behind
`handle`. The snapshot is consumed either way. Returns 1 if anything was
restored, 0 otherwise.

### `CapturableFields(Type)`

<span class="api-kind">method</span>

Instance fields of `type` that a reload should carry, most-derived first
so that a base field shadowed with `new` loses to the derived one when
keyed by name downstream.

### `Capture(ulong)`

<span class="api-kind">method</span>

Snapshot `handle`'s reloadable fields. Returns the snapshot id, or 0 if
the handle is dead or the behaviour has nothing capturable.

### `DefaultsOf(Type)`

<span class="api-kind">method</span>

The values `type`'s constructor produces, for the deviation check. Null
when no throwaway instance could be made, in which case `Capture` keeps
every field. Building that instance runs one constructor per type per
reload, which is why `Behaviour` documents constructors as pure.

### `Discard()`

<span class="api-kind">method</span>

Drop every snapshot the engine did not claim.

### `IsTransient(FieldInfo)`

<span class="api-kind">method</span>

Whether `field` is opted out of preservation, directly or through the
property it backs.

### `TryApply(FieldInfo, object, object)`

<span class="api-kind">method</span>

Write a captured value back onto a field of the reloaded type. Returns
false when the field no longer matches what was captured.
The mirror of [`TryCapture`]; every guard here exists because the field's
type may have changed since capture, which is the premise of a reload
rather than an edge case.

### `TryCapture(FieldInfo, object, System.Object)`

<span class="api-kind">method</span>

Convert a live field value into something safe to outlive the assembly.
Returns false when the type is outside the closed set.
Kept in lock-step with [`TryApply`]: it must accept exactly what this
emits. Widen one without the other and fields silently stop restoring.

---

## BehaviourState.EnumValue

An enum captured structurally: the boxed enum itself would be a
game-assembly instance and would pin the load context.

### `#ctor(string, object)`

<span class="api-kind">method</span>

An enum captured structurally: the boxed enum itself would be a
game-assembly instance and would pin the load context.

---

## BoxCollider

### `HalfExtents`

<span class="api-kind">property</span>

Half the box's size on each axis; the default matches the unit cube
mesh. Note: the engine collides boxes as world-space AABBs, so a
rotated entity gets a conservatively enlarged volume.

---

## Collider

Shape descriptor for World.AddCollider. Dimensions are local-space and get
scaled by the entity's transform scale engine-side.

### `IsTrigger`

<span class="api-kind">property</span>

Triggers fire the same OnCollisionEnter/Exit callbacks as solid
colliders but never resolve overlap — nothing is pushed out of a
trigger, and a trigger is never pushed.

---

## Collision

### `ContactPoint`

<span class="api-kind">field</span>

World-space contact point.

### `Normal`

<span class="api-kind">field</span>

Unit contact normal, pointing from this entity toward Other.

### `Other`

<span class="api-kind">field</span>

The other entity involved in the collision.

---

## Color

An RGBA color with float components, nominally in [0, 1] (values above 1
are meaningful for HDR/emissive use and are not clamped).

### `clear`

<span class="api-kind">property</span>

Fully transparent black.

### `FromHex(string)`

<span class="api-kind">method</span>

Parse a hex color: "RGB", "RRGGBB", or "RRGGBBAA", with or without a
leading '#'. Throws `FormatException` on anything else.

### `Lerp(Color, Color, float)`

<span class="api-kind">method</span>

Linear interpolation; `t` is clamped to [0, 1].

### `op_Multiply(Color, Color)`

<span class="api-kind">method</span>

Component-wise (modulate) multiplication.

### `ToHex(bool)`

<span class="api-kind">method</span>

This color as "RRGGBB" (or "RRGGBBAA"), clamped to [0, 1] per channel.

### `WithAlpha(float)`

<span class="api-kind">method</span>

This color with a different alpha.

---

## ComponentAttribute

Gives a Behaviour a stable identity in the component registry, so its fields
are saved with the scene, shown in the inspector, and carried across a hot
reload.

The id is written into every scene file that references the component, and
is the *only* thing that ties a saved entity back to this class. It is
therefore deliberately not derived from the type's name: rename
`Spinner` to `Rotator` and every scene keeps loading, because the id did not
move. Change the id and they all stop — which is a rename of the component
type as far as the project is concerned, and should be as loud as one.

Convention is `game.thing`, lower case, dotted. Anything unique will do; the
engine reserves the `orrin.` prefix for its own components.

A Behaviour without this attribute still runs — it just has no registry
entry, so its fields are not saved or inspectable. Hot reload still carries
them (see [BehaviourState]).

### `Name`

<span class="api-kind">property</span>

What the inspector calls it. Defaults to the type name, and unlike [Id]
may change freely.

### `#ctor(string)`

<span class="api-kind">method</span>

Gives a Behaviour a stable identity in the component registry, so its fields
are saved with the scene, shown in the inspector, and carried across a hot
reload.

The id is written into every scene file that references the component, and
is the *only* thing that ties a saved entity back to this class. It is
therefore deliberately not derived from the type's name: rename
`Spinner` to `Rotator` and every scene keeps loading, because the id did not
move. Change the id and they all stop — which is a rename of the component
type as far as the project is concerned, and should be as loud as one.

Convention is `game.thing`, lower case, dotted. Anything unique will do; the
engine reserves the `orrin.` prefix for its own components.

A Behaviour without this attribute still runs — it just has no registry
entry, so its fields are not saved or inspectable. Hot reload still carries
them (see [BehaviourState]).

---

## ComponentKinds

### `Of<T>()`

<span class="api-kind">method</span>

The ABI kind id for a script-visible engine component type; throws for
types the engine doesn't expose (better a loud error than a silent
"false" from a typo'd HasComponent check).

---

## Debug

Developer-facing debug output: structured logging that surfaces in the editor
console, and immediate-mode line drawing rendered as a scene overlay.

The `Draw*` methods are marked `ConditionalAttribute` on the
`ORRIN_DEBUG` symbol, so in export builds (which do not define it) the
C# compiler removes the call sites entirely — including argument evaluation —
at zero cost. As a second line of defence the engine also ignores line data
when it is not running the editor overlay. `LogTrace` and
`LogDebug` are stripped the same way, and an export build's engine
would drop them regardless. `Log`, `LogWarning` and
`LogError` are always live, like Unity's `Debug.Log`.

Every log line names the script file and line it was written on. The two
trailing parameters are how: the compiler fills them in at the call site, so
they are never passed by hand.

### `DrawLine(Vector3, Vector3, Color, float)`

<span class="api-kind">method</span>

Draw a line from `from` to `to` in world
space, visible for `duration` seconds (0 = one frame).
Editor-only; stripped from export builds.

### `DrawRay(Vector3, Vector3, Color, float)`

<span class="api-kind">method</span>

Draw a ray from `origin` extending along
`direction` (its full length), visible for
`duration` seconds (0 = one frame). Editor-only.

### `Log(string, string, int)`

<span class="api-kind">method</span>

Log an informational message to the editor console.

### `LogDebug(string, string, int)`

<span class="api-kind">method</span>

Log at debug level. Editor-only; stripped from export builds.

### `LogError(string, string, int)`

<span class="api-kind">method</span>

Log an error to the editor console.

### `LogTrace(string, string, int)`

<span class="api-kind">method</span>

Log at trace level. Editor-only; stripped from export builds.

### `LogWarning(string, string, int)`

<span class="api-kind">method</span>

Log a warning to the editor console.

---

## Entity

### `IsValid`

<span class="api-kind">property</span>

False for the null handle (e.g. a SpawnRenderable given an unknown asset,
an ABI call made outside the script dispatch window, or a field that was
never assigned). This only rules out the null sentinel — it does NOT
detect a stale handle to an entity that has since been despawned; use
HasComponent or a World lookup for that.

### `Null`

<span class="api-kind">property</span>

The null handle: what a failed SpawnRenderable or lookup returns, and
what `default(Entity)` is. Must match Rust CEntity::NULL ({0, 0}).

All-zeroes deliberately. C# gives every struct an all-zeroes `default`
that types cannot override, so an `Entity` field you never assigned —
most often one a hot reload could not restore — reads as this value. The
engine reserves entity slot 0 and never allocates it, so the handle
names nothing and `IsValid` catches the uninitialized case for free.

### `GetComponent<T>()`

<span class="api-kind">method</span>

Typed read of an engine component, or null if the entity lacks it (or
the handle is stale). Components come back by value; write back through
the corresponding setter (Native.SetTransform, World.SetTag). v1
supports Transform and Tag — script-defined components arrive with the
byte-blob milestone.

### `HasComponent<T>()`

<span class="api-kind">method</span>

True while this handle is live and the entity has a T component.

### `op_Equality(Entity, Entity)`

<span class="api-kind">method</span>

Handle equality: same index and generation. Two handles being equal means
they name the same spawn of the same entity — a despawn-and-respawn at the
same index bumps the generation, so a stale handle won't compare equal to
the new occupant.

---

## GameLoadContext

The collectible load context a project's game assembly lives in.

`Orrin.dll` itself is never loaded here. It is the ABI surface — Rust holds
raw `[UnmanagedCallersOnly]` function pointers into it — and a second copy
would be a second, incompatible set of types: the game's `Behaviour` would
not be the engine's `Behaviour`, and every call across the boundary would
fail on a cast. So `Load` hands back the *running* bindings assembly by
reference, which is what guarantees one shared type identity.

Returning it explicitly rather than returning null and letting resolution
fall through to the default context is load-bearing: hostfxr's
`load_assembly_and_get_function_pointer` puts `Orrin.dll` in an isolated
context of its own, so the default context cannot resolve it by name and the
fallback raises `FileNotFoundException` instead.

### `LoadFromCopy(AssemblyLoadContext, string)`

<span class="api-kind">method</span>

Load an assembly from a byte copy rather than by path. Loading by path
memory-maps the file and holds it open for the process lifetime, so the
next `dotnet build` fails to overwrite it on Windows — which would make
the reload loop unusable on the platform. Debug symbols are passed
alongside when present so contained script exceptions keep their file
and line numbers.

---

## Input

### `MousePosition`

<span class="api-kind">property</span>

Cursor position in window coordinates (physical pixels).

### `GetAxis(string, int)`

<span class="api-kind">method</span>

An axis's value. A composed axis reads −1, 0 or 1; an analog one reads
its source, deadzoned and scaled as the config asked. An action name, or
a name nothing binds, reads zero.

### `GetKey(KeyCode)`

<span class="api-kind">method</span>

True while the key is held.

### `GetKeyDown(KeyCode)`

<span class="api-kind">method</span>

True on the frame the key went down.

### `GetKeyUp(KeyCode)`

<span class="api-kind">method</span>

True on the frame the key was released.

### `GetMouseButton(MouseButton)`

<span class="api-kind">method</span>

True while the mouse button is held.

### `GetMouseButtonDown(MouseButton)`

<span class="api-kind">method</span>

True on the frame the mouse button went down.

### `GetMouseButtonUp(MouseButton)`

<span class="api-kind">method</span>

True on the frame the mouse button was released.

### `IsHeld(string, int)`

<span class="api-kind">method</span>

True while any binding for the action is held.

### `IsPressed(string, int)`

<span class="api-kind">method</span>

True on the frame the action went down.

The edge belongs to the action, not to a binding: an action already held
on one binding does not fire again when a second one joins it.

### `IsReleased(string, int)`

<span class="api-kind">method</span>

True on the frame the last binding holding the action let go.

---

## LogLevel

Severity of a log line, quietest first.

The numbering crosses the ABI as a `uint` and matches the engine's own
`LogLevel`: append, never renumber — the same rule as the function
table and the key codes.

_No documented members._

---

## Material

A `.fmat` file under the project's assets directory, or a material the
engine builds, which is always ready.

_No documented members._

---

## Mathf

Float math helpers for gameplay code. Angles at this API surface are in
degrees unless a name says otherwise; use `Mathf.Deg2Rad` /
`Mathf.Rad2Deg` at the boundary with radian-based math.

### `Epsilon`

<span class="api-kind">field</span>

A small value for approximate comparisons (not float.Epsilon).

### `Approximately(float, float)`

<span class="api-kind">method</span>

Approximate equality that scales with the magnitude of the operands.

### `DeltaAngle(float, float)`

<span class="api-kind">method</span>

Shortest signed difference between two angles, in degrees (-180, 180].

### `InverseLerp(float, float, float)`

<span class="api-kind">method</span>

Where `value` sits between a and b, clamped to [0, 1].

### `Lerp(float, float, float)`

<span class="api-kind">method</span>

Linear interpolation; `t` is clamped to [0, 1].

### `LerpAngle(float, float, float)`

<span class="api-kind">method</span>

Lerp between angles in degrees, taking the shortest path around the circle.

### `MoveTowards(float, float, float)`

<span class="api-kind">method</span>

Step from current toward target by at most `maxDelta`.

### `PingPong(float, float)`

<span class="api-kind">method</span>

Bounce `t` back and forth in [0, length].

### `Repeat(float, float)`

<span class="api-kind">method</span>

Wrap `t` into [0, length) (like mod, but never negative).

### `Sign(float)`

<span class="api-kind">method</span>

1 for zero or positive values, -1 for negative (Unity convention).

### `SmoothStep(float, float, float)`

<span class="api-kind">method</span>

Hermite-smoothed interpolation between from and to.

---

## Mesh

A glTF 2.0 file under the project's assets directory, imported as one mesh.

_No documented members._

---

## Prefab

An entity tree saved as a `.fprefab` file under the project's assets
directory, instantiated whole.

### `Instantiate(AssetRef<Orrin.Prefab>)`

<span class="api-kind">method</span>

Spawn the prefab's tree and return its root.

The root is a real handle at once, like `World.SpawnRenderable`'s, but
the tree is built when this tick's structural changes apply: the root's
components and its children are there from the next tick. Logs and
returns `Entity.Null` if the reference names no prefab (check
`IsValid`).

---

## PropertyBag

### `NoSuchHandle`

<span class="api-kind">field</span>

Negative returns from every entry point below. A non-negative result is
the number of bytes the value needs; it was written only if that fits in
the capacity the caller offered, so a caller that guessed too small
retries with the number it got back rather than losing the value.

### `Components(System.Byte*, int)`

<span class="api-kind">method</span>

Every registry-visible Behaviour in the currently loaded game assemblies,
as a `List` of `{ id, type, name }` structs.

This is the game assembly's half of `register_components`: the engine
calls it after each load and registers what comes back, then drops those
entries before the next swap. Enumerating types here rather than having
each assembly export a native symbol is the same explicit-registration
rule from the other side — nothing is discovered by a linker section,
which would not survive the collectible load context anyway.

### `Default(System.Byte*, System.Byte*, int)`

<span class="api-kind">method</span>

The bag a freshly constructed instance of `typeName` produces — the
component's default value, and the layout every other buffer for this
type agrees with.

### `Encode(Behaviour)`

<span class="api-kind">method</span>

The encode and decode halves without the FFI around them, for
`Orrin.MathTests` — which is where the claim that this file and
`orrin-registry`'s `wire` module implement one grammar is actually
checked, the way `sizeof(Transform) == 40` is.

### `Read(ulong, System.Byte*, int)`

<span class="api-kind">method</span>

Encode the behaviour behind `handle` into `buffer`.

### `ReadValue(PropertyBag.Reader, Type)`

<span class="api-kind">method</span>

Returns null when the value was read but cannot be assigned — an unknown
field, or one whose type changed since the buffer was written. Leaving
the field at its constructor value is the same choice [BehaviourState]
makes, and for the same reason: no silent coercion.

### `VisibleFields(Type)`

<span class="api-kind">method</span>

The fields the registry sees: what a hot reload would carry, narrowed to
the types that have a `Value` variant.

Sharing [BehaviourState]'s enumeration is the point — `readonly`,
`[Transient]` and the auto-property backing-field mapping are one rule
with two consumers, and a field that reloads but does not save (or the
reverse) would be a genuinely baffling thing to debug.

### `Write(ulong, System.Byte*, int)`

<span class="api-kind">method</span>

Overwrite the behaviour's visible fields from `data`.

Fields the buffer does not mention keep their current values, which is
what makes a scene saved before a field existed load without erasing it.

---

## PropertyBag.Tag

Lock-step with `wire::tag` in orrin-registry.

_No documented members._

---

## PropertyBag.Writer

Grows by doubling and copies out once, so an entry point never has to
guess a size and the caller never sees a partial buffer.

### `CopyTo(System.Byte*, int)`

<span class="api-kind">method</span>

Copies into `buffer` only if the whole value fits; returns the size
either way, so the caller can size a second attempt exactly.

### `F32(float)`

<span class="api-kind">method</span>

Bits, not a decimal rendering: the boundary must carry a NaN and a
negative zero unchanged, because the Rust side's diff distinguishes
them and would otherwise report an edit nobody made.

### `Field(string, byte)`

<span class="api-kind">method</span>

A field name followed by its value's tag, for the hand-built buffers
in [Components].

### `Guid(Guid)`

<span class="api-kind">method</span>

The sixteen bytes in canonical UUID order, which `Guid`'s default
byte layout is not.

### `U32(uint)`

<span class="api-kind">method</span>

Little-endian by hand rather than through `BitConverter`, which
writes native order — the wire format is fixed, so a big-endian host
must not be able to change it.

---

## Quaternion

A rotation, stored as x/y/z/w (vector part, then scalar — the same layout as
the Rust side's `[f32; 4]` in `CTransform`, so the field order
must not change).

Conventions: angles at the API surface are in degrees; Euler angles apply in
Z-X-Y order (roll, then pitch, then yaw — matching Unity); the canonical
"look" direction is `Vector3.forward` = (0, 0, -1).

### `eulerAngles`

<span class="api-kind">property</span>

The rotation as Euler angles in degrees (Z-X-Y application order),
each wrapped into [0, 360). Note that Euler representations are not
unique; `Euler(q.eulerAngles)` is the same rotation as `q`,
but not necessarily the same three numbers you built it from.

### `Angle(Quaternion, Quaternion)`

<span class="api-kind">method</span>

Unsigned angle between two rotations, in degrees.

### `AngleAxis(float, Vector3)`

<span class="api-kind">method</span>

Rotation of `angleDegrees` around `axis`.

### `Euler(float, float, float)`

<span class="api-kind">method</span>

Rotation from Euler angles in degrees, applied Z (roll), then X (pitch),
then Y (yaw) — the same convention as Unity.

### `FromBasis(Vector3, Vector3, Vector3)`

<span class="api-kind">method</span>

Quaternion from an orthonormal right-handed basis (matrix columns).

### `FromToRotation(Vector3, Vector3)`

<span class="api-kind">method</span>

The shortest-arc rotation taking one direction to another.

### `Inverse(Quaternion)`

<span class="api-kind">method</span>

The reverse rotation (assumes a unit quaternion).

### `Lerp(Quaternion, Quaternion, float)`

<span class="api-kind">method</span>

Normalized linear interpolation (faster than slerp, slightly uneven speed).

### `LookRotation(Vector3, Vector3)`

<span class="api-kind">method</span>

Rotation that turns `Vector3.forward` (-Z) to point along
`forward`, keeping "up" as close to `up`
as possible. Returns identity if `forward` is zero.

### `op_Multiply(Quaternion, Quaternion)`

<span class="api-kind">method</span>

Compose rotations: the result applies `rhs` first, then `lhs`.

### `op_Multiply(Quaternion, Vector3)`

<span class="api-kind">method</span>

Rotate a vector by this rotation.

### `RotateTowards(Quaternion, Quaternion, float)`

<span class="api-kind">method</span>

Step from one rotation toward another by at most `maxDegreesDelta`.

### `Slerp(Quaternion, Quaternion, float)`

<span class="api-kind">method</span>

Spherical interpolation; `t` is clamped to [0, 1].

---

## SphereCollider

### `Radius`

<span class="api-kind">property</span>

The default matches the unit sphere mesh.

---

## Tag

A queryable gameplay label; mirrors the Rust `Tag` component. Fetched by
value — mutating a copy does not write back; assign via World.SetTag.

_No documented members._

---

## Texture

A PNG or JPEG under the project's assets directory.

_No documented members._

---

## Time

Frame timing, read live from the engine's Time resource.

### `DeltaTime`

<span class="api-kind">property</span>

Seconds since the last frame.

### `FrameCount`

<span class="api-kind">property</span>

Frames ticked since engine start; handy for debugging frame-dependent bugs.

### `Total`

<span class="api-kind">property</span>

Total elapsed seconds since engine start.

---

## TransientAttribute

Marks a Behaviour field or property as *not* worth preserving across a hot
reload: a cache, a handle re-acquired in OnStart, anything derivable.

Also silences the "not preserved" warning for a field whose type the reload
could not carry anyway.

_No documented members._

---

## Vector2

A 2D vector of floats. Immutable; operations return new values.

### `normalized`

<span class="api-kind">property</span>

This vector with length 1, or zero if it is too small to normalize.

### `Angle(Vector2, Vector2)`

<span class="api-kind">method</span>

Unsigned angle between two vectors, in degrees.

### `ClampMagnitude(Vector2, float)`

<span class="api-kind">method</span>

Clamp the vector's length to `maxLength`.

### `Lerp(Vector2, Vector2, float)`

<span class="api-kind">method</span>

Linear interpolation; `t` is clamped to [0, 1].

### `MoveTowards(Vector2, Vector2, float)`

<span class="api-kind">method</span>

Step from current toward target by at most `maxDistanceDelta`.

### `Perpendicular(Vector2)`

<span class="api-kind">method</span>

The vector rotated 90 degrees counter-clockwise.

### `Reflect(Vector2, Vector2)`

<span class="api-kind">method</span>

Reflect a vector off a surface with the given normal.

### `Scale(Vector2, Vector2)`

<span class="api-kind">method</span>

Component-wise multiplication.

---

## Vector3

A 3D vector of floats. Immutable; operations return new values.

Orrin is right-handed with -Z as forward (matching the Rust side's glam
conventions), so unlike Unity, `Vector3.forward` is (0, 0, -1) — "into
the screen" from the default camera.

Layout is three sequential floats; it crosses the native ABI inside
`Transform`, so the field order must not change.

### `forward`

<span class="api-kind">property</span>

(0, 0, -1): Orrin is right-handed, -Z forward.

### `normalized`

<span class="api-kind">property</span>

This vector with length 1, or zero if it is too small to normalize.

### `Angle(Vector3, Vector3)`

<span class="api-kind">method</span>

Unsigned angle between two vectors, in degrees.

### `ClampMagnitude(Vector3, float)`

<span class="api-kind">method</span>

Clamp the vector's length to `maxLength`.

### `Cross(Vector3, Vector3)`

<span class="api-kind">method</span>

Right-handed cross product.

### `Lerp(Vector3, Vector3, float)`

<span class="api-kind">method</span>

Linear interpolation; `t` is clamped to [0, 1].

### `MoveTowards(Vector3, Vector3, float)`

<span class="api-kind">method</span>

Step from current toward target by at most `maxDistanceDelta`.

### `Project(Vector3, Vector3)`

<span class="api-kind">method</span>

Project a vector onto another vector.

### `ProjectOnPlane(Vector3, Vector3)`

<span class="api-kind">method</span>

Project a vector onto the plane defined by a normal.

### `Reflect(Vector3, Vector3)`

<span class="api-kind">method</span>

Reflect a vector off a surface with the given normal.

### `Scale(Vector3, Vector3)`

<span class="api-kind">method</span>

Component-wise multiplication.

### `SignedAngle(Vector3, Vector3, Vector3)`

<span class="api-kind">method</span>

Signed angle from one vector to another around an axis, in degrees.

---

## Vector4

A 4D vector of floats. Immutable; operations return new values.

### `normalized`

<span class="api-kind">property</span>

This vector with length 1, or zero if it is too small to normalize.

### `Lerp(Vector4, Vector4, float)`

<span class="api-kind">method</span>

Linear interpolation; `t` is clamped to [0, 1].

### `Scale(Vector4, Vector4)`

<span class="api-kind">method</span>

Component-wise multiplication.

---

## World

### `AddCollider(Entity, Collider)`

<span class="api-kind">method</span>

Queue attaching a collision shape to `entity`; it starts participating
in collision detection next frame. Returns false if the handle was
stale.

### `AddScript<T>(Entity)`

<span class="api-kind">method</span>

Queue attaching a Behaviour of type T to `entity`. The instance is
created when this tick's commands apply; OnEnable/OnStart fire on the
next tick. Returns false if the handle was stale.

### `Despawn(Entity)`

<span class="api-kind">method</span>

Queue the entity for despawn at the end of this tick. Returns false if
the handle was already stale.

### `FindAllByTag(string)`

<span class="api-kind">method</span>

Every entity whose Tag equals `tag`; empty array if none.

### `FindByTag(string)`

<span class="api-kind">method</span>

First entity whose Tag equals `tag`, or null if none. "First" is the
engine's storage order — stable between structural changes but
otherwise arbitrary, so don't rely on it when several entities share a
tag; use FindAllByTag instead.

### `SetMaterial(Entity, string)`

<span class="api-kind">method</span>

Queue a material swap (names come from the same registry as
SpawnRenderable). Logs and returns false if the name is unknown or the
handle was stale.

### `SetTag(Entity, string)`

<span class="api-kind">method</span>

Queue a tag assignment (set or replace) for `entity`. Applied after
this tick like other structural changes, so a FindByTag in the same
tick won't see it yet. Returns false if the handle was stale.

### `Spawn()`

<span class="api-kind">method</span>

Spawn an empty entity.

### `SpawnRenderable(string, string, Transform)`

<span class="api-kind">method</span>

Spawn an entity rendered with a mesh and material registered in the
engine's asset registry (meshes: "cube", "sphere", "plane"; materials:
"gold", "copper", "glossy", "clay", "neon", "textured", "rock",
"ground"). Logs and returns Entity.Null if a name is unknown (check
IsValid).


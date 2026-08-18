# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An in-progress isometric Souls-like (boss-rush action game, à la *Eldest Souls*), built on **Phaser 3** and written in **TypeScript**. A playable character on an isometric ground grid with dodge-roll and a melee attack, a world hub connected via portals to multiple boss encounters (each its own instance/room), and a small data-driven content system (templates/spawns/instances/portals as JSON) for placing creatures — inspired by TrinityCore's `creature_template`/`creature`/script-registry split.

The codebase is an **npm workspaces monorepo**: [packages/engine/](packages/engine/) holds generic, Phaser-agnostic building blocks (`@phazer/engine`); [apps/soulslike/](apps/soulslike/) holds the actual game (`@phazer/soulslike`). See "Monorepo layout" below.

An older Phaser 2 prototype (data-driven creature/spell system, hiboux NPCs) lives under [legacy/src/](legacy/src/), excluded from the build; see "Legacy prototype" below before reusing anything from it.

## Commands

```bash
npm install     # install dependencies and link the @phazer/* workspace packages
npm run build    # compiles packages/*/src/**/*.ts + apps/*/src/**/*.ts -> app.js (via tsc -p .)
node expressServer.js   # serve the app at http://localhost:3000 (static file server)
```

There is no test suite (`npm test` is a placeholder that exits with an error) and no linter configured.

Open `index.html` directly in a browser after building, or serve it via `expressServer.js`. It loads the local `systemjs` package, `node_modules/phaser/dist/phaser.js` (Phaser global), and the compiled `app.js`, then does `SystemJS.import('apps/soulslike/src/main')`.

## Monorepo layout

Two workspace packages under a single root `tsconfig.json`/build (no per-package compilation, no bundler):

- **`packages/engine`** (`@phazer/engine`) — generic, game-agnostic, **zero Phaser dependency**: `IsoMath` (projection math), `StateMachine` (generic, extensible FSM — see below), `ContentDatabase`/`ScriptRegistry`/content type definitions (see "Content system" below), and the migrated `Dictionary`/`Guid` utils.
- **`apps/soulslike`** (`@phazer/soulslike`) — everything Phaser/game-specific: entities (`Player`, `Boss`, `SentinelBoss`, `Mob`, `Portal`, `IsoEntity` base class), `ArenaScene`, input handling, and the game's JSON content under `apps/soulslike/src/content/`.

`apps/soulslike` depends on `@phazer/engine` via a real workspace link (`node_modules/@phazer/engine` → `packages/engine`, created by `npm install`). Cross-package imports use the bare specifier (`import { IsoMath } from '@phazer/engine'`), resolved via `moduleResolution: "Node10"` + each package's `package.json` `types`/`main` pointing straight at its `src/index.ts` (no separate compile step per package — everything still compiles together into one `app.js` via `module: "system"` + `outFile`, same as before the split). `rootDir` is set to the repo root so System-module names stay stable (e.g. `apps/soulslike/src/main`, `packages/engine/src/iso/IsoMath`) — that's why `index.html` imports `'apps/soulslike/src/main'` rather than `'main'`.

## Build system specifics

- TypeScript compiles with `module: "system"` and bundles everything into a single **`outFile: ./app.js`** (see [tsconfig.json](tsconfig.json)) — there is no per-file JS output. `include` covers `./packages/*/src/**/*.ts` and `./apps/*/src/**/*.ts` only, so anything under `legacy/` is excluded automatically.
- Phaser is loaded globally via a `<script>` tag (not imported as an ES module); [apps/soulslike/src/main.ts](apps/soulslike/src/main.ts) pulls in its ambient types with a triple-slash reference to `node_modules/phaser/types/phaser.d.ts`. That reference only needs to exist in one compiled file — once it's in the program, the global `Phaser` namespace is visible everywhere. Only `apps/soulslike` depends on `phaser`; `packages/engine` doesn't (and shouldn't).
- `skipLibCheck` is on in tsconfig — Phaser's shipped `.d.ts` references newer DOM lib types (`VideoFrameCallbackMetadata`) that require a reasonably current TypeScript; keep the `typescript` devDependency well above 3.x or the build breaks on that file even with `skipLibCheck` off.
- For debugging, the live `Phaser.Game` instance is exposed as `window.game` (see `main.ts`) — e.g. `window.game.scene.getScene('Arena').player` from the browser console. The single scene is always registered under the key `'Arena'` regardless of which instance/room it's currently showing (see `ArenaScene` below).
- Synthetic keyboard events dispatched by browser-automation tools don't reliably reach the Phaser canvas in sandboxed preview panes — verifying input-driven behavior (movement, attack, dodge) is more reliable by calling entity `.update(...)` methods directly from the browser console than by simulating key presses.

## Architecture

### Isometric projection

[packages/engine/src/iso/IsoMath.ts](packages/engine/src/iso/IsoMath.ts) converts between **world** coordinates (a plain cartesian grid used for game logic — arena bounds, tile lookups) and **screen** coordinates (what gets rendered), using a standard 2:1 diamond projection (`TILE_WIDTH: 128`, `TILE_HEIGHT: 64`). Both `toScreen`/`toWorld` are linear (no translation), so they can convert deltas as well as absolute positions — this matters for input handling (see below).

### Movement is screen-directional, not world-axis

[apps/soulslike/src/input/PlayerInput.ts](apps/soulslike/src/input/PlayerInput.ts) maps WASD/arrows to **on-screen** cardinal directions (up/down/left/right as the player visually perceives them), not world axes — pressing "up" always moves the character toward the top of the screen even though that's a diagonal move in world space. [Player.ts](apps/soulslike/src/entities/Player.ts) then converts the intended screen-space velocity to a world-space delta via `IsoMath.toWorld()` each frame, accumulates it into `worldX`/`worldY` (clamped to the current instance's `arenaExtent`), and re-derives the screen position via `IsoMath.toScreen()` for rendering. This keeps movement speed visually uniform in all 8 directions and keeps world coordinates authoritative for game logic.

`IsoEntity` ([apps/soulslike/src/entities/IsoEntity.ts](apps/soulslike/src/entities/IsoEntity.ts)) is the shared base for every world entity (`Player`, `Boss`, `SentinelBoss`, `Mob`, `Portal`): world position bookkeeping, arena clamping, and the `IsoMath.toScreen` + `setPosition` + `setDepth(this.y)` dance every entity repeats each frame (depth sorting uses screen Y as Phaser depth — the standard painter's-algorithm trick for a flat isometric ground plane).

### Generic state machine

[packages/engine/src/logic/StateMachine.ts](packages/engine/src/logic/StateMachine.ts) is a small, generic, extensible FSM: states are declared as data (`Record<TState, { onEnter?, onUpdate?, onExit? }>`) rather than a hand-written switch, and `onUpdate` requests a transition by returning the next state's name. Every AI in the game (`Boss`, `SentinelBoss`, `Mob`'s patrol/chase) is built on this — see `Boss.States`/`SentinelBoss.States`/`Mob.States` for the pattern (a `private static readonly States` record whose handlers close over `this` via arrow functions, since the FSM's context type is the entity itself).

### Combat

- **Dodge roll**: on a dodge key edge (`JustDown`), if not already dodging/attacking and off cooldown, `Player` locks in a direction (current input, or last facing if none held) and moves at `DODGE_SPEED` for `DODGE_DURATION` ms while `IsInvincible` is true and alpha drops to 0.55. Dodging through a `Boss` lunge or a `SentinelBoss` shockwave evades the damage.
- **Attack**: on the attack key edge (mutually exclusive with dodging), `Player` roots in place for `ATTACK_DURATION` ms with a visible weapon swing; `ConsumeAttackHit()` lets exactly one boss/creature register a hit per swing. Bosses call `player.IsAttackActive`/`player.AttackRange`/`player.ConsumeAttackHit()` from their own `update()` to check whether they got hit — the boss owns the hit-detection, not the player.
- **Health/death**: `Player.IsDefeated` (health ≤ 0) freezes input and dims the sprite; `Boss`/`SentinelBoss` have an explicit `dead` FSM state. `ArenaScene` reacts to both (`checkPlayerDefeated`/`checkBossDefeated`), showing a result message and auto-returning to `world_hub` after a delay — see `ArenaScene.showResultMessage`/`scheduleReturn`.
- **Two boss archetypes**, deliberately different: `Boss` ("The Hollowed Warden") chases then telegraphs a dashing lunge — a dodge-timing check. `SentinelBoss` ("The Ashen Sentinel") never moves; it telegraphs a growing warning ring then damages anyone still inside its radius on release — a positioning check. `Mob` is a weak patrol creature that aggroes/chases/deals contact damage within range and de-aggroes (with hysteresis) back to patrolling — see [apps/soulslike/src/entities/](apps/soulslike/src/entities/).

### Content system (data-driven creatures & instances)

Modeled on TrinityCore's `creature_template` (identity/behavior) vs. `creature` (placement) split, kept intentionally simple: plain JSON served statically, no database/backend.

- **Types** ([packages/engine/src/content/ContentTypes.ts](packages/engine/src/content/ContentTypes.ts)): `CreatureTemplate` (`entry`, `name`, `scriptName`, `isBoss`), `CreatureSpawn` (`entry` + `instanceId` + world position), `InstanceDefinition` (`id`, `name`, `arenaExtent`), `PortalDefinition` (source position + `targetInstanceId`/target position).
- **`ContentDatabase`** ([packages/engine/src/content/ContentDatabase.ts](packages/engine/src/content/ContentDatabase.ts)) fetches and indexes the four JSON files (`apps/soulslike/src/content/*.json`) at boot, before `main.ts` constructs the `Phaser.Game`.
- **`ScriptRegistry`** ([packages/engine/src/content/ScriptRegistry.ts](packages/engine/src/content/ScriptRegistry.ts)) is a generic name → factory map, generalizing the legacy prototype's `ScriptedCreature` name-matched list. [apps/soulslike/src/content/CreatureScripts.ts](apps/soulslike/src/content/CreatureScripts.ts) registers each `scriptName` (e.g. `boss_hollowed_warden`) against a factory that constructs the concrete class.
- **`ArenaScene`** ([apps/soulslike/src/scenes/ArenaScene.ts](apps/soulslike/src/scenes/ArenaScene.ts)) is instance-agnostic: on `init({instanceId, entryX, entryY})` it looks up the `InstanceDefinition`, builds a ground grid sized to `arenaExtent`, spawns every `CreatureSpawn` for that instance via the registry, and places `Portal` markers. It never imports concrete creature classes — it only knows the structural `UpdatableEntity`/`BossLike` types ([apps/soulslike/src/content/GameContent.ts](apps/soulslike/src/content/GameContent.ts)) and reads `template.isBoss` to decide which spawn drives the boss HP bar/victory flow. **Adding a new boss/mob/dungeon is JSON rows + one script registration — no scene or engine changes.**
- Walking within `PORTAL_TRIGGER_DISTANCE` of a `Portal` calls `this.scene.start('Arena', {instanceId, entryX, entryY})`, re-running `create()` from scratch for the target instance (a fresh `Player`/creatures/HUD every time — there's no persistent world state between instances yet). Portal placement must land the player far enough from the *destination* instance's own portal to avoid an instant bounce-back loop (see the existing `apps/soulslike/src/content/portals.json` entries for the safe-distance convention used).
- Current content: `world_hub` (the hub, two portals out), `dungeon_crimson_keep` (a mob room) → `dungeon_crimson_keep_sanctum` (The Hollowed Warden, reached via a portal inside the mob room), and `sentinel_spire` (The Ashen Sentinel, reached directly from the hub).

### Legacy prototype (`legacy/src/`)

The original Phaser 2 game — `DatabaseSingleton` (JSON-driven creature/spell DB + factory), `Creature`/`Spell` models, the `ScriptedCreature`/`ScriptedSpell` name-based script registry, and `npc_hiboux`/`npc_cloud`/spell scripts — is preserved but **not compiled or wired into the game** (Phaser 2 APIs like `Phaser.Sprite`/`Phaser.Physics.ARCADE`/`Phaser.Point` don't exist in Phaser 3). Useful as a reference for the "data row + optional scripted subclass, matched by name" pattern that inspired the current content system above, but don't try to import it directly. Its asset files (sprites/sounds/JSON data it loads at runtime) live alongside it under [legacy/Assets/](legacy/Assets/). `Dictionary<T>` and the GUID generator survived the migration and now live in `packages/engine/src/Utils/` (current, used by `@phazer/engine`).

Comments and identifiers in the legacy domain logic are largely in French.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An in-progress isometric Souls-like (boss-rush action game, à la *Eldest Souls*), built on **Phaser 3** and written in **TypeScript**. Currently just the movement/camera/arena foundation — a playable placeholder character on an isometric ground grid with dodge-roll — no combat or bosses yet.

An older Phaser 2 prototype (data-driven creature/spell system, hiboux NPCs) lives under [legacy/src/](legacy/src/), excluded from the build; see "Legacy prototype" below before reusing anything from it.

## Commands

```bash
npm install     # install dependencies
npm run build    # compiles src/**/*.ts -> app.js (via tsc -p .)
node expressServer.js   # serve the app at http://localhost:3000 (static file server)
```

There is no test suite (`npm test` is a placeholder that exits with an error) and no linter configured.

Open `index.html` directly in a browser after building, or serve it via `expressServer.js`. It loads the local `systemjs` package, `node_modules/phaser/dist/phaser.js` (Phaser global), and the compiled `app.js`, then does `SystemJS.import('main')`.

## Build system specifics

- TypeScript compiles with `module: "system"` / `moduleResolution: "Classic"` and bundles everything into a single **`outFile: ./app.js`** (see [tsconfig.json](tsconfig.json)) — there is no per-file JS output. `include` is `./src/**/*.ts` only, so anything under `legacy/` is excluded automatically.
- Phaser is loaded globally via a `<script>` tag (not imported as an ES module); [src/main.ts](src/main.ts) pulls in its ambient types with a triple-slash reference to `node_modules/phaser/types/phaser.d.ts`. That reference only needs to exist in one compiled file — once it's in the program, the global `Phaser` namespace is visible everywhere.
- `skipLibCheck` is on in tsconfig — Phaser's shipped `.d.ts` references newer DOM lib types (`VideoFrameCallbackMetadata`) that require a reasonably current TypeScript; keep the `typescript` devDependency well above 3.x or the build breaks on that file even with `skipLibCheck` off.
- For debugging, the live `Phaser.Game` instance is exposed as `window.game` (see `main.ts`) — e.g. `window.game.scene.getScene('GameScene').player` from the browser console.

## Architecture

### Isometric projection

[src/iso/IsoMath.ts](src/iso/IsoMath.ts) converts between **world** coordinates (a plain cartesian grid used for game logic — arena bounds, tile lookups) and **screen** coordinates (what gets rendered), using a standard 2:1 diamond projection (`TILE_WIDTH: 128`, `TILE_HEIGHT: 64`). Both `toScreen`/`toWorld` are linear (no translation), so they can convert deltas as well as absolute positions — this matters for input handling (see below).

### Movement is screen-directional, not world-axis

[src/input/PlayerInput.ts](src/input/PlayerInput.ts) maps WASD/arrows to **on-screen** cardinal directions (up/down/left/right as the player visually perceives them), not world axes — pressing "up" always moves the character toward the top of the screen even though that's a diagonal move in world space. [src/entities/Player.ts](src/entities/Player.ts) then converts the intended screen-space velocity to a world-space delta via `IsoMath.toWorld()` each frame, accumulates it into `worldX`/`worldY` (clamped to `ARENA_EXTENT`), and re-derives the screen position via `IsoMath.toScreen()` for rendering. This keeps movement speed visually uniform in all 8 directions and keeps world coordinates authoritative for future logic (collision, tile snapping, boss arena bounds).

Depth sorting (both for the ground tiles in [src/scenes/GameScene.ts](src/scenes/GameScene.ts) and the player) uses the object's **screen Y** as its Phaser depth — the standard painter's-algorithm trick for a flat isometric ground plane.

### Dodge roll

`Player.update()` is a small state machine: on a dodge key edge (`JustDown`), if not already dodging and off cooldown, it locks in a direction (current input, or last facing if no input is held) and moves at `DODGE_SPEED` for `DODGE_DURATION` ms while `IsInvincible` is true and alpha drops to 0.55 as visual feedback; afterwards `DODGE_COOLDOWN` ms blocks the next dodge. There's no hit/damage system yet to consume `IsInvincible` — it's exposed for that to hook into later.

### Legacy prototype (`legacy/src/`)

The original Phaser 2 game — `DatabaseSingleton` (JSON-driven creature/spell DB + factory), `Creature`/`Spell` models, the `ScriptedCreature`/`ScriptedSpell` name-based script registry, and `npc_hiboux`/`npc_cloud`/spell scripts — is preserved but **not compiled or wired into the game** (Phaser 2 APIs like `Phaser.Sprite`/`Phaser.Physics.ARCADE`/`Phaser.Point` don't exist in Phaser 3). Useful as a reference for the "data row + optional scripted subclass, matched by name" pattern if a similar system is built for bosses, but don't try to import it directly. [src/Utils/Dictionnary.ts](src/Utils/Dictionnary.ts) and [src/Utils/Guid.ts](src/Utils/Guid.ts) (a custom `Dictionary<T>` and GUID generator) survived the migration and are still current.

Comments and identifiers in the legacy domain logic are largely in French.

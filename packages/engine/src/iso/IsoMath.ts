export interface Point2 {
    x: number;
    y: number;
}

/**
 * 2:1 isometric projection helpers. World coordinates are a plain cartesian
 * grid (used for game logic, arena bounds, tile lookups); screen coordinates
 * are what gets rendered. Both conversions are linear (no translation), so
 * they can be applied to deltas as well as absolute positions.
 */
export class IsoMath {
    static readonly TILE_WIDTH = 128;
    static readonly TILE_HEIGHT = 64;

    static toScreen(worldX: number, worldY: number): Point2 {
        const halfW = IsoMath.TILE_WIDTH / 2;
        const halfH = IsoMath.TILE_HEIGHT / 2;
        return {
            x: (worldX - worldY) * halfW,
            y: (worldX + worldY) * halfH
        };
    }

    static toWorld(screenX: number, screenY: number): Point2 {
        const halfW = IsoMath.TILE_WIDTH / 2;
        const halfH = IsoMath.TILE_HEIGHT / 2;
        return {
            x: (screenX / halfW + screenY / halfH) / 2,
            y: (screenY / halfH - screenX / halfW) / 2
        };
    }
}

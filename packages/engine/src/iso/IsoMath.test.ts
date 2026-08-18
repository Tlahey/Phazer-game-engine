import { describe, it, expect } from 'vitest';
import { IsoMath } from './IsoMath';

describe('IsoMath', () => {
    it('projects world axes into the expected 2:1 diamond', () => {
        expect(IsoMath.toScreen(1, 0)).toEqual({ x: 64, y: 32 });
        expect(IsoMath.toScreen(0, 1)).toEqual({ x: -64, y: 32 });
    });

    it('maps the world origin to the screen origin', () => {
        expect(IsoMath.toScreen(0, 0)).toEqual({ x: 0, y: 0 });
    });

    it('toWorld is the inverse of toScreen', () => {
        const original = { x: 3.5, y: -2.25 };
        const screen = IsoMath.toScreen(original.x, original.y);
        const world = IsoMath.toWorld(screen.x, screen.y);

        expect(world.x).toBeCloseTo(original.x);
        expect(world.y).toBeCloseTo(original.y);
    });

    it('is linear, so a delta converts the same way as an absolute position', () => {
        const a = IsoMath.toScreen(2, 3);
        const b = IsoMath.toScreen(5, 7);
        const delta = IsoMath.toScreen(3, 4);

        expect(b.x - a.x).toBeCloseTo(delta.x);
        expect(b.y - a.y).toBeCloseTo(delta.y);
    });
});

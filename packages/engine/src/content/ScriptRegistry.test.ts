import { describe, it, expect } from 'vitest';
import { ScriptRegistry } from './ScriptRegistry';

describe('ScriptRegistry', () => {
    it('creates an instance via the registered factory', () => {
        const registry = new ScriptRegistry<(x: number) => number>();
        registry.register('double', x => x * 2);

        expect(registry.create('double', 21)).toBe(42);
    });

    it('throws a descriptive error for an unregistered script name', () => {
        const registry = new ScriptRegistry<() => void>();

        expect(() => registry.create('missing')).toThrow(/missing/);
    });

    it('lets a later registration override an earlier one for the same name', () => {
        const registry = new ScriptRegistry<() => string>();
        registry.register('greet', () => 'hello');
        registry.register('greet', () => 'hi');

        expect(registry.create('greet')).toBe('hi');
    });
});

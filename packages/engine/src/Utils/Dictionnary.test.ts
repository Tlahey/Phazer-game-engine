import { describe, it, expect } from 'vitest';
import { Dictionary } from './Dictionnary';

describe('Dictionary', () => {
    it('adds and retrieves items by key', () => {
        const dict = new Dictionary<number>();
        dict.Add('a', 1);

        expect(dict.Item('a')).toBe(1);
        expect(dict.ContainsKey('a')).toBe(true);
        expect(dict.ContainsKey('b')).toBe(false);
    });

    it('tracks count as items are added and removed', () => {
        const dict = new Dictionary<number>();
        dict.Add('a', 1);
        dict.Add('b', 2);

        expect(dict.Count()).toBe(2);

        dict.Remove('a');

        expect(dict.Count()).toBe(1);
        expect(dict.ContainsKey('a')).toBe(false);
    });

    it('lists keys and values', () => {
        const dict = new Dictionary<string>();
        dict.Add('x', 'one');
        dict.Add('y', 'two');

        expect(dict.Keys().sort()).toEqual(['x', 'y']);
        expect(dict.Values().map(v => v.Value).sort()).toEqual(['one', 'two']);
    });

    it('finds an object by a property value', () => {
        const dict = new Dictionary<{ id: number; name: string }>();
        dict.Add('a', { id: 1, name: 'first' });
        dict.Add('b', { id: 2, name: 'second' });

        expect(dict.GetObjectByPropertyValue('id', 2)).toEqual({ id: 2, name: 'second' });
        expect(dict.GetObjectByPropertyValue('id', 999)).toBeUndefined();
    });
});

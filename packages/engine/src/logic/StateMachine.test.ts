import { describe, it, expect, vi } from 'vitest';
import { StateMachine, StateDefinition } from './StateMachine';

type State = 'a' | 'b';

describe('StateMachine', () => {
    it('calls onEnter for the initial state on construction', () => {
        const onEnterA = vi.fn();
        const states: Record<State, StateDefinition<object, State>> = {
            a: { onEnter: onEnterA },
            b: {}
        };

        new StateMachine({}, states, 'a');

        expect(onEnterA).toHaveBeenCalledTimes(1);
    });

    it('transitions when onUpdate returns a different state name', () => {
        const states: Record<State, StateDefinition<object, State>> = {
            a: { onUpdate: () => 'b' },
            b: {}
        };

        const fsm = new StateMachine({}, states, 'a');
        fsm.update(16);

        expect(fsm.Current).toBe('b');
    });

    it('stays in the current state when onUpdate returns void', () => {
        const states: Record<State, StateDefinition<object, State>> = {
            a: { onUpdate: () => undefined },
            b: {}
        };

        const fsm = new StateMachine({}, states, 'a');
        fsm.update(16);

        expect(fsm.Current).toBe('a');
    });

    it('calls onExit of the old state then onEnter of the new state, in order', () => {
        const calls: string[] = [];
        const states: Record<State, StateDefinition<object, State>> = {
            a: { onExit: () => calls.push('exitA') },
            b: { onEnter: () => calls.push('enterB') }
        };

        const fsm = new StateMachine({}, states, 'a');
        fsm.transition('b');

        expect(calls).toEqual(['exitA', 'enterB']);
    });

    it('does not re-trigger enter/exit when onUpdate returns the current state', () => {
        const onEnterA = vi.fn();
        const onExitA = vi.fn();
        const states: Record<State, StateDefinition<object, State>> = {
            a: { onEnter: onEnterA, onExit: onExitA, onUpdate: () => 'a' },
            b: {}
        };

        const fsm = new StateMachine({}, states, 'a');
        onEnterA.mockClear();
        fsm.update(16);

        expect(onEnterA).not.toHaveBeenCalled();
        expect(onExitA).not.toHaveBeenCalled();
    });

    it('passes the context and deltaMs through to onUpdate', () => {
        const context = { value: 42 };
        const onUpdateA = vi.fn();
        const states: Record<State, StateDefinition<typeof context, State>> = {
            a: { onUpdate: onUpdateA },
            b: {}
        };

        const fsm = new StateMachine(context, states, 'a');
        fsm.update(16);

        expect(onUpdateA).toHaveBeenCalledWith(context, 16);
    });
});

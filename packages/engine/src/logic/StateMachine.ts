/**
 * Generic, extensible finite state machine. `TContext` is whatever data the
 * states need to read/write (often the owning entity itself); `TState` is a
 * union of state name string literals. States are declared as data (a map of
 * name -> handlers) rather than a hand-written switch, so new entities (Boss,
 * NPC, ...) can be built by composing state definitions instead of
 * duplicating dispatch logic.
 *
 * An `onUpdate` handler can request a transition by returning the next
 * state's name; returning nothing keeps the machine in its current state.
 */
export interface StateDefinition<TContext, TState extends string> {
    onEnter?(context: TContext): void;
    onUpdate?(context: TContext, deltaMs: number): TState | void;
    onExit?(context: TContext): void;
}

export class StateMachine<TContext, TState extends string> {

    private readonly context: TContext;
    private readonly states: Record<TState, StateDefinition<TContext, TState>>;
    private current: TState;

    constructor(context: TContext, states: Record<TState, StateDefinition<TContext, TState>>, initialState: TState) {
        this.context = context;
        this.states = states;
        this.current = initialState;
        this.states[this.current].onEnter?.(this.context);
    }

    public get Current(): TState {
        return this.current;
    }

    public update(deltaMs: number): void {
        const next = this.states[this.current].onUpdate?.(this.context, deltaMs);
        if (next !== undefined && next !== this.current) {
            this.transition(next as TState);
        }
    }

    public transition(next: TState): void {
        this.states[this.current].onExit?.(this.context);
        this.current = next;
        this.states[this.current].onEnter?.(this.context);
    }
}

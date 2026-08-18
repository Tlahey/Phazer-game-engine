/**
 * Generic name -> factory registry, generalizing the "match a template's
 * scriptName against a registered class" pattern (TrinityCore's C++ script
 * registry; the legacy prototype's `ScriptedCreature` list) into a reusable
 * primitive. Not tied to creatures — any factory signature works.
 */
export class ScriptRegistry<TFactory extends (...args: any[]) => any> {

    private factories = new Map<string, TFactory>();

    public register(scriptName: string, factory: TFactory): void {
        this.factories.set(scriptName, factory);
    }

    public create(scriptName: string, ...args: Parameters<TFactory>): ReturnType<TFactory> {
        const factory = this.factories.get(scriptName);
        if (!factory) {
            throw new Error(`No script registered for "${scriptName}"`);
        }
        return factory(...args);
    }
}

import type { PersistedCritterState } from './critter.ts';
type Exact<T, Shape> = Record<Exclude<keyof T, keyof Shape>, never> & T;
export declare const loadState: (browser?: boolean) => Partial<PersistedCritterState> | undefined;
export declare const saveState: <State extends PersistedCritterState>(state: Exact<State, PersistedCritterState>, browser?: boolean) => void;
export {};

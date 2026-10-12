import { type CritterData } from './data.ts';
export type { CritterData } from './data.ts';
export interface CritterOptions {
    browser?: boolean;
    debug?: boolean;
}
export declare class Critter {
    readonly debug: boolean;
    private engine;
    constructor({ browser, debug }?: CritterOptions);
    static create: (options?: CritterOptions) => Critter;
    static isAlive: ({ browser, }?: Pick<CritterOptions, "browser">) => boolean;
    clean: () => CritterData;
    dismiss: () => CritterData;
    feed: () => CritterData;
    heal: () => CritterData;
    play: () => CritterData;
    sleep: () => CritterData;
    status: () => CritterData;
    stop: () => CritterData;
    private run;
}

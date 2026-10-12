import { type Stage } from './config.ts';
import { type CritterRenderState } from './critter.ts';
type SpriteName = CritterRenderState['bottom'] | CritterRenderState['sprite'] | CritterRenderState['top'];
export declare const loadSprite: ({ height, name, padding, reverse, stage, width, }: {
    height?: number;
    name: SpriteName;
    padding?: number;
    reverse?: boolean;
    stage?: Stage;
    width?: number;
}) => string[];
export interface Plain {
    actionTime: number;
    age: number;
    debug?: boolean;
    energy: number;
    happiness: number;
    health: number;
    noNerdFonts: boolean;
    satiety: number;
    state: CritterRenderState;
    toilet: number;
}
export declare const plainSprites: ({ state }: Pick<Plain, "state">) => string;
export declare const plainStats: ({ actionTime, age, debug, energy, happiness, health, noNerdFonts, satiety, state, toilet, }: Plain) => string;
export declare const plain: (options: Plain) => string;
export {};

import { type CritterRenderState } from './critter.ts';
interface EmoticonProps {
    noNerdFonts?: boolean;
    state: CritterRenderState;
}
export declare const emoticon: ({ noNerdFonts, state }: EmoticonProps) => string;
export interface Bars {
    energy: number;
    happiness: number;
    health: number;
    noNerdFonts: boolean;
    satiety: number;
    toilet: number;
}
export declare const bars: ({ energy, happiness, health, noNerdFonts, satiety, toilet, }: Bars) => string;
export declare const conditions: ({ noNerdFonts, state, }: {
    noNerdFonts: boolean;
    state: CritterRenderState;
}) => string;
export interface Short extends Bars {
    actionTime: number;
    state: CritterRenderState;
}
export declare const short: ({ energy, happiness, health, noNerdFonts, satiety, state, toilet, }: Short) => string;
export {};

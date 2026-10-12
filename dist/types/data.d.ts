import { type Action } from './critter.ts';
import { type Plain } from './plain.ts';
export interface Data extends Omit<Plain, 'noNerdFonts'> {
    action: Action;
    alert: boolean;
    poo: boolean;
}
export declare const data: (options: Data) => {
    action: Action;
    actionTime: number;
    alert: boolean;
    Bars: string;
    'Bars-nonerd': string;
    emoticon: string;
    'emoticon-nonerd': string;
    Energy: number;
    Happy: number;
    Health: number;
    Hunger: number;
    plain: string;
    'plain-nonerd': string;
    plainSprites: string;
    plainStats: string;
    'plainStats-nonerd': string;
    poo: boolean;
    short: string;
    'short-nonerd': string;
    Toilet: number;
};
export type CritterData = ReturnType<typeof data>;

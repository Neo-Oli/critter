export declare const max = 1000000;
export declare const high: number;
export declare const normal: number;
export declare const low: number;
export declare const binName = "critter";
export declare const penalty = 0.1;
export declare const speed = 1;
export type Stage = 0 | 1 | 2;
export declare const stagingSchedule: {
    stage0: number;
    stage1: number;
};
export declare const schedules: {
    energy: {
        awake: number;
        playing: number;
        sleeping: number;
        sleepingSick: number;
    };
    happiness: {
        idle: number;
        playing: number;
        playingTired: number;
    };
    health: {
        happinessLow: number;
        happinessZero: number;
        healing: number;
        healingAction: number;
        hungry: number;
        poo: number;
        recovery: number;
        starving: number;
    };
    satiety: {
        eating: number;
        idle: number;
        playing: number;
    };
    toilet: {
        high: number;
        low: number;
        normal: number;
    };
};

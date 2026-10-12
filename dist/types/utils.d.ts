export declare const now: () => number;
export declare const minute = 60;
export declare const hour: number;
export declare const day: number;
export declare const duration: (seconds: number) => string;
export declare const actionDuration: (seconds: number) => string;
export type StatName = 'age' | 'energy' | 'happiness' | 'health' | 'satiety' | 'toilet';
export declare const statIcon: (name: StatName, noNerdFonts: boolean) => string;

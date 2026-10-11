import { day, hour, minute } from './utils.ts'

export const max = 1000000
export const high = Math.round((max / 4) * 3)
export const normal = Math.round(max / 2)
export const low = Math.round(max / 4)
export const binName = 'critter'
export const happinessPenalty = 10000
export const speed = 1
export const schedules = {
    energy: {
        awake: day,
        playing: 10 * 2 * minute,
        sleeping: 2 * hour,
    },
    happiness: {
        idle: 6 * hour,
        playing: 2 * minute,
        playingTired: 4 * minute,
    },
    health: {
        healing: 20,
        healingAction: 10,
        hungry: 4 * day,
        poo: 2 * day,
        recovery: 12 * hour,
        starving: 2 * day,
    },
    satiety: {
        eating: 2 * minute,
        idle: day / 3,
        playing: 5 * 2 * minute,
    },
    toilet: {
        high: day / 3,
        low: day,
        normal: day / 2,
    },
}

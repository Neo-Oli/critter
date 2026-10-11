import { max } from './config.ts'
import { type Action, type Mood } from './critter.ts'
import cleaning from './sprites/cleaning.txt' with { type: 'text' }
import dead from './sprites/dead.txt' with { type: 'text' }
import dirty from './sprites/dirty.txt' with { type: 'text' }
import eating from './sprites/eating.txt' with { type: 'text' }
import happy from './sprites/happy.txt' with { type: 'text' }
import healing from './sprites/healing.txt' with { type: 'text' }
import hungry from './sprites/hungry.txt' with { type: 'text' }
import idle from './sprites/idle.txt' with { type: 'text' }
import playing from './sprites/playing.txt' with { type: 'text' }
import refusing from './sprites/refusing.txt' with { type: 'text' }
import sad from './sprites/sad.txt' with { type: 'text' }
import sick from './sprites/sick.txt' with { type: 'text' }
import sleeping from './sprites/sleeping.txt' with { type: 'text' }
import tired from './sprites/tired.txt' with { type: 'text' }
import { duration } from './utils.ts'
const spriteWidth = 16
const loadSprite = (name: Action | Mood) => {
    const sprites = {
        cleaning: cleaning,
        dead: dead,
        dirty: dirty,
        eating: eating,
        happy: happy,
        healing: healing,
        hungry: hungry,
        idle: idle,
        playing: playing,
        refusing: refusing,
        sad: sad,
        sick: sick,
        sleeping: sleeping,
        tired: tired,
    }
    return sprites[name].split(/\r?\n/)
}

interface Plain {
    actionTime: number
    age: number
    cleanliness: number
    energy: number
    happiness: number
    health: number
    noNerdFonts: boolean
    satiety: number
    state: Action | Mood
}
export const plain = ({
    actionTime,
    age,
    cleanliness,
    energy,
    happiness,
    health,
    noNerdFonts,
    satiety,
    state,
}: Plain) => {
    const output = loadSprite(state).map((line) => line.padEnd(spriteWidth + 2))
    const stat = (name: string, value: number) => {
        const barValue = Math.round((value / max) * 10)
        let empty, full, half
        if (noNerdFonts) {
            empty = '○'
            half = '◐'
            full = '●'
        } else {
            empty = '󰋕'
            half = '󰛞'
            full = '󰋑'
        }
        const maxBarValue = Math.min(barValue, 10)
        let bar = full.repeat(Math.floor(maxBarValue / 2))
        if (maxBarValue % 2) {
            bar += half
        }
        bar += empty.repeat(
            Math.max(0, 5 - Math.floor(barValue / 2 + (maxBarValue % 2))),
        )
        return `${label(name)}${bar}`
    }
    const label = (str: string) => {
        return `${str}: `.padEnd(8)
    }
    let i = 0
    const remaining = actionTime > 0 ? ` (${duration(actionTime)})` : ''
    output[i++] += `${state.toUpperCase()}${remaining}`
    output[i++] += stat('Happy', happiness)
    output[i++] += stat('Hunger', satiety)
    output[i++] += stat('Energy', energy)
    output[i++] += stat('Health', health)
    output[i++] += stat('Clean', cleanliness)
    output[i++] += label('Age') + duration(age)

    return output.join('\n')
}

import { max, type Stage } from './config.ts'
import { type CritterRenderState } from './critter.ts'
import food from './sprites/food.txt' with { type: 'text' }
import ill from './sprites/ill.txt' with { type: 'text' }
import medicine from './sprites/medicine.txt' with { type: 'text' }
import poo from './sprites/poo.txt' with { type: 'text' }
import idle0 from './sprites/stage-0/idle.txt' with { type: 'text' }
import dead1 from './sprites/stage-1/dead.txt' with { type: 'text' }
import happy1 from './sprites/stage-1/happy.txt' with { type: 'text' }
import hungry1 from './sprites/stage-1/hungry.txt' with { type: 'text' }
import idle1 from './sprites/stage-1/idle.txt' with { type: 'text' }
import refusing1 from './sprites/stage-1/refusing.txt' with { type: 'text' }
import sad1 from './sprites/stage-1/sad.txt' with { type: 'text' }
import sick1 from './sprites/stage-1/sick.txt' with { type: 'text' }
import sleeping1 from './sprites/stage-1/sleeping.txt' with { type: 'text' }
import tired1 from './sprites/stage-1/tired.txt' with { type: 'text' }
import dead2 from './sprites/stage-2/dead.txt' with { type: 'text' }
import happy2 from './sprites/stage-2/happy.txt' with { type: 'text' }
import hungry2 from './sprites/stage-2/hungry.txt' with { type: 'text' }
import idle2 from './sprites/stage-2/idle.txt' with { type: 'text' }
import refusing2 from './sprites/stage-2/refusing.txt' with { type: 'text' }
import sad2 from './sprites/stage-2/sad.txt' with { type: 'text' }
import sick2 from './sprites/stage-2/sick.txt' with { type: 'text' }
import sleeping2 from './sprites/stage-2/sleeping.txt' with { type: 'text' }
import tired2 from './sprites/stage-2/tired.txt' with { type: 'text' }
import toy from './sprites/toy.txt' with { type: 'text' }
import { duration } from './utils.ts'
const spriteWidth = 16
const spriteHeight = 8
const iconWidth = 8
const iconHeight = 4
type SpriteName =
    | CritterRenderState['bottom']
    | CritterRenderState['sprite']
    | CritterRenderState['top']
const sharedSprites: Partial<Record<SpriteName, string>> = {
    food,
    ill,
    medicine,
    none: '',
    poo,
    toy,
}
const stageSprites: Record<Stage, Partial<Record<SpriteName, string>>> = {
    0: { idle: idle0 },
    1: {
        dead: dead1,
        happy: happy1,
        hungry: hungry1,
        idle: idle1,
        refusing: refusing1,
        sad: sad1,
        sick: sick1,
        sleeping: sleeping1,
        tired: tired1,
    },
    2: {
        dead: dead2,
        happy: happy2,
        hungry: hungry2,
        idle: idle2,
        refusing: refusing2,
        sad: sad2,
        sick: sick2,
        sleeping: sleeping2,
        tired: tired2,
    },
}
export const loadSprite = ({
    height = spriteHeight,
    name,
    padding = 0,
    reverse = false,
    stage = 2,
    width = spriteWidth,
}: {
    height?: number
    name: SpriteName
    padding?: number
    reverse?: boolean
    stage?: Stage
    width?: number
}) => {
    const sprite = sharedSprites[name] ?? stageSprites[stage][name] ?? ''
    return sprite
        .split(/\r?\n/)
        .concat(Array(height).fill(''))
        .slice(0, height)
        .map((line: string) => {
            const sized = line.slice(0, width).padEnd(width)
            const oriented = reverse
                ? sized.split('').reverse().join('')
                : sized
            return `${oriented}${' '.repeat(padding)}`
        })
}

export interface Plain {
    actionTime: number
    age: number
    debug?: boolean
    energy: number
    happiness: number
    health: number
    noNerdFonts: boolean
    satiety: number
    state: CritterRenderState
    toilet: number
}
export const plain = ({
    actionTime,
    age,
    debug = false,
    energy,
    happiness,
    health,
    noNerdFonts,
    satiety,
    state,
    toilet,
}: Plain) => {
    const { bottom, main, reverse, sprite, top } = state
    const topSprite = loadSprite({
        height: iconHeight,
        name: top,
        stage: state.stage,
        width: iconWidth,
    })
    const bottomSprite = loadSprite({
        height: iconHeight,
        name: bottom,
        stage: state.stage,
        width: iconWidth,
    })
    const output = loadSprite({
        height: spriteHeight,
        name: sprite,
        padding: 1,
        reverse,
        stage: state.stage,
        width: spriteWidth,
    })

    for (let i = 0; i < iconHeight; i++) {
        output[i] += topSprite[i]
        output[i + iconHeight] += bottomSprite[i]
    }
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
        return `${label(name)}${bar}${debug ? ` (${value})` : ''}`
    }
    const label = (str: string) => {
        return `${str}: `.padEnd(8)
    }

    const remaining = actionTime > 0 ? ` (${duration(actionTime)})` : ''
    const o = (line: string = '') => {
        output.push(`${line}`)
    }
    o()
    if (state.stage !== 0) {
        o(`${main.toUpperCase()}${remaining}`)
        o(stat('Happy', happiness))
        o(stat('Hunger', satiety))
        o(stat('Energy', energy))
        o(stat('Health', health))
        o(stat('Toilet', toilet))
    }
    o(label('Age') + duration(age))
    return output.map((line) => line.trimEnd()).join('\n')
}

import { max } from './config.ts'
import { type Action, type Mood } from './critter.ts'
import dead from './sprites/dead.txt' with { type: 'text' }
import food from './sprites/food.txt' with { type: 'text' }
import happy from './sprites/happy.txt' with { type: 'text' }
import healing from './sprites/healing.txt' with { type: 'text' }
import hungry from './sprites/hungry.txt' with { type: 'text' }
import idle from './sprites/idle.txt' with { type: 'text' }
import poo from './sprites/poo.txt' with { type: 'text' }
import refusing from './sprites/refusing.txt' with { type: 'text' }
import sad from './sprites/sad.txt' with { type: 'text' }
import sick from './sprites/sick.txt' with { type: 'text' }
import sleeping from './sprites/sleeping.txt' with { type: 'text' }
import tired from './sprites/tired.txt' with { type: 'text' }
import toy from './sprites/toy.txt' with { type: 'text' }
import { duration } from './utils.ts'
const spriteWidth = 16
const spriteHeight = 8
const iconWidth = 8
const iconHeight = 4
type AdditionalSprites = 'food' | 'none' | 'poo' | 'toy'
const loadSprite = (
    name: AdditionalSprites | Mood | Omit<Action, 'eating'>,
    width = spriteWidth,
    height = spriteHeight,
    reverse = false,
) => {
    const sprites = {
        dead: dead,
        food: food,
        happy: happy,
        healing: healing,
        hungry: hungry,
        idle: idle,
        none: '',
        poo: poo,
        refusing: refusing,
        sad: sad,
        sick: sick,
        sleeping: sleeping,
        tired: tired,
        toy: toy,
    }
    return sprites[name]
        .split(/\r?\n/)
        .concat(Array(height).fill(''))
        .slice(0, height)
        .map((line) =>
            reverse ? line.padEnd(width).split('').reverse().join('') : line,
        )
}

interface Plain {
    actionTime: number
    age: number
    debug?: boolean
    energy: number
    happiness: number
    health: number
    noNerdFonts: boolean
    satiety: number
    state: Action | Mood
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
    const topSprite = loadSprite(top, iconWidth, iconHeight)
    const bottomSprite = loadSprite(bottom, iconWidth, iconHeight)
    const output = loadSprite(sprite, spriteWidth, spriteHeight, reverse)

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
    o(`${main.toUpperCase()}${remaining}`)
    o(stat('Happy', happiness))
    o(stat('Hunger', satiety))
    o(stat('Energy', energy))
    o(stat('Health', health))
    o(stat('Toilet', toilet))
    o(label('Age') + duration(age))
    return output.join('\n')
}

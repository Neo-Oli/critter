import cleaning from './sprites/cleaning.txt' with { type: 'text' }
import dirty from './sprites/dirty.txt' with { type: 'text' }
import eating from './sprites/eating.txt' with { type: 'text' }
import happy from './sprites/happy.txt' with { type: 'text' }
import hungry from './sprites/hungry.txt' with { type: 'text' }
import idle from './sprites/idle.txt' with { type: 'text' }
import healing from './sprites/healing.txt' with { type: 'text' }
import stuffed from './sprites/stuffed.txt' with { type: 'text' }
import playing from './sprites/playing.txt' with { type: 'text' }
import sad from './sprites/sad.txt' with { type: 'text' }
import dead from './sprites/dead.txt' with { type: 'text' }
import sick from './sprites/sick.txt' with { type: 'text' }
import sleeping from './sprites/sleeping.txt' with { type: 'text' }
import tired from './sprites/tired.txt' with { type: 'text' }
import { type Action, type Mood } from './critter.ts'
const spriteWidth = 16
interface Plain {
    state: Action | Mood
    satiety: number
}
const loadSprite = (name: Action | Mood) => {
    const sprites = {
        cleaning: cleaning,
        dirty: dirty,
        eating: eating,
        happy: happy,
        hungry: hungry,
        stuffed: stuffed,
        dead: dead,
        idle: idle,
        healing: healing,
        playing: playing,
        sad: sad,
        sick: sick,
        sleeping: sleeping,
        tired: tired,
    }
    return sprites[name].split(/\r?\n/)
}
export const plain = ({ satiety, state }: Plain) => {
    const output = loadSprite(state).map((line) => line.padEnd(spriteWidth + 2))

    let i = 0
    output[i++] += state.toUpperCase()
    output[i++] += state.toUpperCase()

    return output.join('\n')
}

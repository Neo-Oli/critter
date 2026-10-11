import { type CritterRenderState } from './critter.ts'
import { max  } from './config.ts'

export const emoticon = (state: CritterRenderState) => {
    const baseSet = {
        dead: '[RIP]',
        happy: 'ʕ＾ᴥ＾ʔ',
        hungry: 'ʕºᴥºʔ',
        idle: 'ʕ•ᴥ•ʔ',
        refusing: 'ʕˋᴥˊʔ',
        sad: 'ʕ；ᴥ；ʔ',
        sick: 'ʕ×ᴥ×ʔ',
        sleeping: 'zZz',
        tired: 'ʕ-ᴥ-ʔ',
    }
    const bears: {
        0: { idle: string }
        1: Record<CritterRenderState['sprite'], string>
        2: Record<CritterRenderState['sprite'], string>
    } = {
        0: { idle: '( . )' },
        1: baseSet,
        2: baseSet,
    }
    return state.stage === 0 ? bears[0].idle : bears[state.stage][state.sprite]
}

const bar = (value: number, icon: string) => {
    const bars="▁▂▃▅▇█".split("")
    const barValue = Math.round((value / max) * bars.length-1)

    return `${icon}${bars[barValue]}`
}
export interface Bars {
    energy: number
    happiness: number
    health: number
    noNerdFonts: boolean
    satiety: number
    toilet: number
}
export const bars = ({
    energy,
    happiness,
    health,
    noNerdFonts,
    satiety,
    toilet,
}: Bars) => {
    return [
        bar(energy, noNerdFonts ? 'E' : '󱊣'),
        bar(happiness, noNerdFonts ? 'H' : '󰱱'),
        bar(health, noNerdFonts ? '+' : ''),
        bar(satiety, noNerdFonts ? 'S' : '󰉛'),
        bar(toilet, noNerdFonts ? 'T' : ''),
    ].join(' ')
}

export interface Short extends Bars {
    actionTime: number
    state: CritterRenderState
}
export const short = ({
    energy,
    happiness,
    health,
    noNerdFonts,
    satiety,
    state,
    toilet,
}: Short) => {
    return `${emoticon(state)} ${bars({ energy, happiness, health, noNerdFonts, satiety, toilet })}`
}

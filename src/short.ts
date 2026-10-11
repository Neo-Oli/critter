import { max } from './config.ts'
import { type CritterRenderState } from './critter.ts'

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
    const bars = ' ▁▂▃▅▇█'.split('')
    const barValue = Math.min(
        bars.length - 1,
        Math.max(0, Math.ceil((value / max) * (bars.length - 1))),
    )

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
    
        bar(happiness, noNerdFonts ? 'H' : '󰱱'),
        bar(satiety, noNerdFonts ? 'S' : '󰉛'),
        bar(energy, noNerdFonts ? 'E' : '󱊣'),
        bar(health, noNerdFonts ? '+' : ''),
        bar(toilet, noNerdFonts ? 'T' : '󰦫'),
    ].join(' ')
}

export const conditions = ({
    noNerdFonts,
    state,
}: {
    noNerdFonts: boolean
    state: CritterRenderState
}) => {
    const icons: Record<CritterRenderState['top'], [string, string]> = {
        food: ['♨', '󰉛'],
        ill: ['!', '󰚌'],
        medicine: ['✚', ''],
        none: ['', ''],
        poo: ['≋', ' '],
        toy: ['○', '󰨦'],
    }
    return [state.bottom, state.top]
        .map((condition) => icons[condition][noNerdFonts ? 0 : 1])
        .filter(Boolean).join("")
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
    return `${emoticon(state)}${conditions({ noNerdFonts, state })} ${bars({ energy, happiness, health, noNerdFonts, satiety, toilet })}`
}

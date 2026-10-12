import { type Action } from './critter.ts'
import { plain, type Plain, plainSprites, plainStats } from './plain.ts'
import { bars, emoticon, short } from './short.ts'

export interface Data extends Omit<Plain, 'noNerdFonts'> {
    action: Action
    alert: boolean
    poo: boolean
}

export const data = (options: Data) => {
    const {
        action,
        actionTime,
        alert,
        energy,
        happiness,
        health,
        poo,
        satiety,
        state,
        toilet,
    } = options
    const nerdOptions = { ...options, noNerdFonts: false }
    const noNerdOptions = { ...options, noNerdFonts: true }

    return {
        action,
        actionTime,
        alert,
        Bars: bars({
            energy,
            happiness,
            health,
            noNerdFonts: false,
            satiety,
            toilet,
        }),
        'Bars-nonerd': bars({
            energy,
            happiness,
            health,
            noNerdFonts: true,
            satiety,
            toilet,
        }),
        emoticon: emoticon({ noNerdFonts: false, state }),
        'emoticon-nonerd': emoticon({ noNerdFonts: true, state }),
        Energy: energy,
        Happy: happiness,
        Health: health,
        Hunger: satiety,
        plain: plain(nerdOptions),
        'plain-nonerd': plain(noNerdOptions),
        plainSprites: plainSprites(options),
        plainStats: plainStats(nerdOptions),
        'plainStats-nonerd': plainStats(noNerdOptions),
        poo,
        short: short(nerdOptions),
        'short-nonerd': short(noNerdOptions),
        Toilet: toilet,
    }
}

export type CritterData = ReturnType<typeof data>

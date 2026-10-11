import { type Action } from './critter.ts'
import { plain, type Plain, plainSprites, plainStats } from './plain.ts'
import { bars, emoticon, short } from './short.ts'

export interface Json extends Plain {
    action: Action
    alert: boolean
    poo: boolean
}

export const json = (options: Json) => {
    const {
        action,
        actionTime,
        alert,
        energy,
        happiness,
        health,
        noNerdFonts,
        poo,
        satiety,
        state,
        toilet,
    } = options

    return JSON.stringify(
        {
            action,
            actionTime,
            alert,
            Bars: bars({
                energy,
                happiness,
                health,
                noNerdFonts,
                satiety,
                toilet,
            }),
            emoticon: emoticon({ noNerdFonts, state }),
            Energy: energy,
            Happy: happiness,
            Health: health,
            Hunger: satiety,
            plain: plain(options),
            plainSprites: plainSprites(options),
            plainStats: plainStats(options),
            poo,
            short: short(options),
            Toilet: toilet,
        },
        null,
        2,
    )
}

import { describe, expect, it } from 'vitest'

import { max } from '../config.ts'
import { type CritterRenderState } from '../critter.ts'
import { json, type Json } from '../json.ts'
import { plain, plainSprites, plainStats } from '../plain.ts'
import { bars, emoticon, short } from '../short.ts'

describe('json output', () => {
    it('includes rendered output and individual state values', () => {
        const state: CritterRenderState = {
            bottom: 'poo',
            main: 'idle',
            reverse: false,
            sprite: 'sick',
            stage: 2,
            top: 'ill',
        }
        const options: Json = {
            action: 'idle',
            actionTime: 0,
            age: 120,
            alert: true,
            debug: false,
            energy: max,
            happiness: max,
            health: max,
            noNerdFonts: true,
            poo: true,
            satiety: max,
            state,
            toilet: max,
        }
        const result = JSON.parse(json(options))

        expect(Object.keys(result)).toHaveLength(15)
        expect(Object.keys(result)).toEqual(
            expect.arrayContaining([
                'alert',
                'short',
                'plain',
                'plainStats',
                'plainSprites',
                'emoticon',
                'Bars',
                'Happy',
                'Hunger',
                'Energy',
                'Health',
                'Toilet',
                'poo',
                'action',
                'actionTime',
            ]),
        )
        expect(result).toEqual({
            action: options.action,
            actionTime: options.actionTime,
            alert: options.alert,
            Bars: bars(options),
            emoticon: emoticon({ noNerdFonts: true, state }),
            Energy: options.energy,
            Happy: options.happiness,
            Health: options.health,
            Hunger: options.satiety,
            plain: plain(options),
            plainSprites: plainSprites(options),
            plainStats: plainStats(options),
            poo: options.poo,
            short: short(options),
            Toilet: options.toilet,
        })
    })
})

import { describe, expect, it } from 'vitest'

import { max } from '../config.ts'
import { type CritterRenderState } from '../critter.ts'
import { bars, conditions, emoticon, short } from '../short.ts'
import { statIcon } from '../utils.ts'

const state = (
    overrides: Partial<CritterRenderState> = {},
): CritterRenderState => ({
    bottom: 'none',
    main: 'idle',
    reverse: false,
    sprite: 'idle',
    stage: 2,
    top: 'none',
    ...overrides,
})

const stats = {
    energy: max,
    happiness: max,
    health: max,
    noNerdFonts: true,
    satiety: max,
    toilet: max,
}

describe('short emoticons', () => {
    it.each(['eating', 'healing', 'playing'] as const)(
        'selects the body sprite rather than the %s action',
        (main) => {
            expect(emoticon({ state: state({ main, sprite: 'sick' }) })).toBe(
                emoticon({ state: state({ sprite: 'sick' }) }),
            )
        },
    )
})

describe('short bars', () => {
    const renderAll = (value: number) =>
        bars({
            ...stats,
            energy: value,
            happiness: value,
            health: value,
            satiety: value,
            toilet: value,
        })

    it('uses consistent bands with clamped values', () => {
        const bands = [
            [0, 0],
            [1, 166666],
            [166667, 333333],
            [333334, 500000],
            [500001, 666666],
            [666667, 833333],
            [833334, max],
        ]
        const outputs = bands.map(([minimum, maximum]) => {
            expect(renderAll(minimum)).toBe(renderAll(maximum))
            return renderAll(minimum)
        })

        expect(renderAll(-1)).toBe(outputs[0])
        expect(renderAll(max + 1)).toBe(outputs.at(-1))
        for (let index = 1; index < outputs.length; index++) {
            expect(outputs[index]).not.toBe(outputs[index - 1])
        }
    })

    it('renders each stat independently', () => {
        const baseline = bars(stats)
        for (const stat of [
            'energy',
            'happiness',
            'health',
            'satiety',
            'toilet',
        ] as const) {
            expect(bars({ ...stats, [stat]: 0 })).not.toBe(baseline)
        }
    })

    it.each([
        ['age', 'A', '󰥔'],
        ['happiness', 'H', '󰱱'],
        ['satiety', 'S', '󰉛'],
        ['energy', 'E', '󱊣'],
        ['health', '+', ''],
        ['toilet', 'T', '󰦫'],
    ] as const)('provides reusable %s icons', (name, fallback, nerdFont) => {
        expect(statIcon(name, true)).toBe(fallback)
        expect(statIcon(name, false)).toBe(nerdFont)
    })
})

describe('short conditions', () => {
    it.each([true, false])('composes bottom then top (%s)', (noNerdFonts) => {
        const bottom = conditions({
            noNerdFonts,
            state: state({ bottom: 'poo' }),
        })
        const top = conditions({ noNerdFonts, state: state({ top: 'ill' }) })

        expect(
            conditions({
                noNerdFonts,
                state: state({ bottom: 'poo', top: 'ill' }),
            }),
        ).toBe(`${bottom}${top}`)
        expect(conditions({ noNerdFonts, state: state() })).toBe('')
    })
})

describe('short output', () => {
    it('snapshots complete stage, mood, and action output', () => {
        const snapshot = (renderState: CritterRenderState, name: string) => {
            expect(
                `\n${short({
                    ...stats,
                    actionTime: 30,
                    energy: 0,
                    happiness: 250000,
                    health: 500000,
                    satiety: 750000,
                    state: renderState,
                })}\n`,
            ).toMatchSnapshot(name)
        }

        snapshot(state({ stage: 0 }), 'stage-0-egg')
        const sprites = [
            'dead',
            'happy',
            'hungry',
            'idle',
            'refusing',
            'sad',
            'sick',
            'sleeping',
            'tired',
        ] as const
        for (const stage of [1, 2] as const) {
            for (const sprite of sprites) {
                snapshot(
                    state({ main: sprite, sprite, stage }),
                    `stage-${stage}-${sprite}`,
                )
            }
            for (const main of ['eating', 'healing', 'playing'] as const) {
                for (const sprite of ['idle', 'sick'] as const) {
                    for (const poo of [false, true]) {
                        const bottom =
                            main === 'eating'
                                ? 'food'
                                : main === 'playing'
                                  ? 'toy'
                                  : poo
                                    ? 'poo'
                                    : 'none'
                        const top =
                            main === 'healing'
                                ? 'heal'
                                : sprite === 'sick'
                                  ? 'ill'
                                  : 'none'
                        snapshot(
                            state({ bottom, main, sprite, stage, top }),
                            `stage-${stage}-${main}-${sprite}-${bottom}-${top}`,
                        )
                    }
                }
            }
        }
    })

    it.each([true, false])(
        'composes the output without a timer or newline (%s)',
        (noNerdFonts) => {
            const renderState = state({ bottom: 'poo', top: 'ill' })
            const input = {
                ...stats,
                actionTime: 30,
                noNerdFonts,
                state: renderState,
            }
            const output = short(input)

            expect(output).toBe(
                `${emoticon({ noNerdFonts, state: renderState })} ${bars(input)}`,
            )
            expect(output).not.toContain('\n')
            expect(output).not.toContain(String(input.actionTime))
            expect(output).not.toContain('ALERT!')
        },
    )

    it('omits empty conditions', () => {
        const renderState = state()
        const output = short({ ...stats, actionTime: 30, state: renderState })

        expect(output).toBe(
            `${emoticon({ state: renderState })} ${bars(stats)}`,
        )
    })
})

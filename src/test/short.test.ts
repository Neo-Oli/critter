import { describe, expect, it } from 'vitest'

import { max } from '../config.ts'
import { type CritterRenderState } from '../critter.ts'
import { bars, conditions, emoticon, short } from '../short.ts'

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
    it('renders the stage-zero egg', () => {
        expect(emoticon(state({ stage: 0 }))).toBe('( . )')
    })

    const expressions: Record<CritterRenderState['sprite'], string> = {
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

    describe.each([1, 2] as const)('stage %i', (stage) => {
        it.each(Object.entries(expressions))(
            'renders %s',
            (sprite, expected) => {
                expect(
                    emoticon(
                        state({
                            sprite: sprite as CritterRenderState['sprite'],
                            stage,
                        }),
                    ),
                ).toBe(expected)
            },
        )
    })

    it.each(['eating', 'healing', 'playing'] as const)(
        'selects the body sprite rather than the %s action',
        (main) => {
            expect(emoticon(state({ main, sprite: 'sick' }))).toBe('ʕ×ᴥ×ʔ')
        },
    )
})

describe('short bars', () => {
    it.each([
        [-1, ' '],
        [0, ' '],
        [1, '▁'],
        [100000, '▁'],
        [166666, '▁'],
        [166667, '▂'],
        [333333, '▂'],
        [333334, '▃'],
        [500000, '▃'],
        [500001, '▅'],
        [666666, '▅'],
        [666667, '▇'],
        [833333, '▇'],
        [833334, '█'],
        [max, '█'],
        [max + 1, '█'],
    ])('renders value %i as %s without undefined glyphs', (value, glyph) => {
        expect(
            bars({
                ...stats,
                energy: value,
                happiness: value,
                health: value,
                satiety: value,
                toilet: value,
            }),
        ).toBe(`H${glyph} S${glyph} E${glyph} +${glyph} T${glyph}`)
    })

    it('keeps stat order and selects Nerd Font icons', () => {
        expect(bars({ ...stats, noNerdFonts: false })).toBe('󰱱█ 󰉛█ 󱊣█ █ █')
    })

    it('renders each stat independently', () => {
        expect(
            bars({
                ...stats,
                energy: 0,
                happiness: 250000,
                health: 500000,
                satiety: 750000,
            }),
        ).toBe('H▂ S▇ E  +▃ T█')
    })
})

describe('short conditions', () => {
    const icons: Record<CritterRenderState['top'], [string, string]> = {
        food: ['♨', '󰉛'],
        ill: ['!', '󰀦'],
        medicine: ['✚', '󰤓'],
        none: ['', ''],
        poo: ['≋', '󰟝'],
        toy: ['○', '󰝺'],
    }

    it.each(Object.entries(icons))(
        'renders both icon variants for %s',
        (asset, variants) => {
            for (const noNerdFonts of [true, false]) {
                const expected = variants[noNerdFonts ? 0 : 1]
                const condition = asset as CritterRenderState['top']
                expect(
                    conditions({
                        noNerdFonts,
                        state: state({ bottom: condition }),
                    }),
                ).toBe(expected)
                expect(
                    conditions({
                        noNerdFonts,
                        state: state({ top: condition }),
                    }),
                ).toBe(expected)
            }
        },
    )

    it.each([true, false])(
        'joins bottom before top without spaces (Unicode: %s)',
        (noNerdFonts) => {
            expect(
                conditions({
                    noNerdFonts,
                    state: state({ bottom: 'poo', top: 'ill' }),
                }),
            ).toBe(noNerdFonts ? '≋!' : '󰟝󰀦')
        },
    )
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
                                ? 'medicine'
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

    it('puts condition icons immediately after the emoticon and then the bars', () => {
        expect(
            short({
                ...stats,
                actionTime: 30,
                state: state({
                    bottom: 'poo',
                    main: 'sick',
                    sprite: 'sick',
                    top: 'ill',
                }),
            }),
        ).toBe('ʕ×ᴥ×ʔ≋! H█ S█ E█ +█ T█')
    })

    it('omits empty conditions and does not add an action timer or newline', () => {
        expect(short({ ...stats, actionTime: 30, state: state() })).toBe(
            'ʕ•ᴥ•ʔ H█ S█ E█ +█ T█',
        )
    })

    it('uses Nerd Font condition and bar icons consistently', () => {
        expect(
            short({
                ...stats,
                actionTime: 10,
                noNerdFonts: false,
                state: state({ main: 'healing', top: 'medicine' }),
            }),
        ).toBe('ʕ•ᴥ•ʔ󰤓 󰱱█ 󰉛█ 󱊣█ █ █')
    })
})

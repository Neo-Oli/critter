import { beforeEach, describe, expect, it, vi } from 'vitest'

import { high, low, max, normal } from '../config.ts'
import { Critter } from '../critter.ts'
import { loadSprite, plain } from '../plain.ts'

const runtime = vi.hoisted(() => ({ time: 1000000 }))
const storage = vi.hoisted(() => ({ loadState: vi.fn(), saveState: vi.fn() }))

vi.mock('../io.ts', () => storage)
vi.mock('../utils.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils.ts')>()),
    now: () => runtime.time,
}))

const render = (overrides: Partial<Parameters<typeof plain>[0]> = {}) =>
    plain({
        actionTime: 0,
        age: 0,
        debug: false,
        energy: max,
        happiness: max,
        health: max,
        noNerdFonts: true,
        satiety: max,
        state: {
            bottom: 'none',
            main: 'idle',
            reverse: false,
            sprite: 'idle',
            top: 'none',
        },
        toilet: max,
        ...overrides,
    })

const makeCritter = (state: Partial<Critter> = {}) =>
    Object.assign(new Critter({ command: 'new' }), state)

beforeEach(() => {
    runtime.time = 1000000
    storage.loadState.mockReset()
    storage.saveState.mockReset()
})

describe('plain rendering', () => {
    it('snapshots every reachable body, top, and bottom sprite combination', () => {
        const pet = makeCritter()
        const combinations = new Map<string, string>()
        const actions = [
            'idle',
            'eating',
            'healing',
            'playing',
            'refusing',
            'sleeping',
        ] as const

        for (const action of actions) {
            for (const health of [low - 1, low, normal, max]) {
                for (const energy of [low - 1, low]) {
                    for (const satiety of [low - 1, low, high, high + 1]) {
                        if (action === 'eating' && satiety > high) continue
                        for (const happiness of [0, low, high + 1]) {
                            for (const poo of [false, true]) {
                                pet.action = action
                                pet.actionTime = action === 'idle' ? 0 : 30
                                pet.health = health
                                pet.energy = energy
                                pet.satiety = satiety
                                pet.happiness = happiness
                                pet.poo = poo
                                pet.updateMood()

                                const state = pet.getCritterState()
                                const layers = [
                                    state.sprite,
                                    state.top,
                                    state.bottom,
                                ]
                                const key = layers.join('-')
                                if (!combinations.has(key)) {
                                    combinations.set(
                                        key,
                                        `\n${pet.plain({ noNerdFonts: true })}\n`,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        pet.die()
        const deadState = pet.getCritterState()
        const deadLayers = [deadState.sprite, deadState.top, deadState.bottom]
        combinations.set(
            deadLayers.join('-'),
            `\n${pet.plain({ noNerdFonts: true })}\n`,
        )

        for (const [layers, output] of combinations) {
            expect(output).toMatchSnapshot(`sprite layers ${layers}`)
        }
    })

    it('makes every sprite row exactly the requested width', () => {
        const names = [
            'dead',
            'food',
            'happy',
            'hungry',
            'idle',
            'ill',
            'medicine',
            'none',
            'poo',
            'refusing',
            'sad',
            'sick',
            'sleeping',
            'tired',
            'toy',
        ] as const

        for (const name of names) {
            for (const reverse of [false, true]) {
                const rows = loadSprite({
                    height: 8,
                    name,
                    reverse,
                    width: 11,
                })
                expect(rows).toHaveLength(8)
                expect(rows.every((row) => row.length === 11)).toBe(true)
            }
        }
    })

    it('adds fixed padding after optional width padding and reversal', () => {
        const reversed = loadSprite({
            height: 1,
            name: 'ill',
            reverse: true,
            width: 10,
        })
        const paddedReversed = loadSprite({
            height: 1,
            name: 'ill',
            padding: 2,
            reverse: true,
            width: 10,
        })
        expect(paddedReversed).toEqual([`${reversed[0]}  `])

        const normal = loadSprite({ height: 1, name: 'ill', width: 10 })
        const padded = loadSprite({
            height: 1,
            name: 'ill',
            padding: 2,
            width: 10,
        })
        expect(padded).toEqual([`${normal[0]}  `])
    })

    it('renders the sprite layer and stat details without undefined values', () => {
        const output = render({
            state: {
                bottom: 'food',
                main: 'eating',
                reverse: true,
                sprite: 'happy',
                top: 'none',
            },
        })
        expect(output).toContain('EATING')
        expect(output).toContain('Happy:')
        expect(output).toContain('Hunger:')
        expect(output).toContain('Energy:')
        expect(output).toContain('Health:')
        expect(output).toContain('Toilet:')
        expect(output).toContain('Age:')
        expect(output).not.toContain('undefined')
        expect(
            output.split('\n').every((line) => line === line.trimEnd()),
        ).toBe(true)
    })

    it('renders zero, half-segment, and full bars with five positions', () => {
        const full = String.fromCodePoint(0x25cf)
        const half = String.fromCodePoint(0x25d0)
        const empty = String.fromCodePoint(0x25cb)
        const output = render({ energy: max / 10, happiness: 0 })
        expect(output).toContain(`Happy:  ${empty.repeat(5)}`)
        expect(output).toContain(`Energy: ${half}${empty.repeat(4)}`)
        expect(output).toContain(`Health: ${full.repeat(5)}`)
    })

    it('caps an over-range stat bar without an overflow marker', () => {
        const output = render({ satiety: max + 1 })
        expect(output).toContain('Hunger:')
        expect(output).not.toContain('!')
    })

    it('appends exact stat values after bars in debug mode', () => {
        const output = render({ debug: true, happiness: 123456 })
        expect(output).toContain('(123456)')
        expect(render({ happiness: 123456 })).not.toContain('123456')
    })

    it('uses private-use Nerd Font glyphs only when enabled', () => {
        expect(render({ noNerdFonts: false })).toMatch(/\p{Co}/u)
        expect(render()).not.toMatch(/\p{Co}/u)
    })

    it('shows action time and age using the duration helper', () => {
        const output = render({
            actionTime: 7200,
            age: 172800,
            state: {
                bottom: 'none',
                main: 'sleeping',
                reverse: false,
                sprite: 'sleeping',
                top: 'none',
            },
        })
        expect(output).toContain('SLEEPING (2 hours)')
        expect(output).toContain('Age:    2 days')
        expect(render()).toContain('IDLE\n')
    })
})

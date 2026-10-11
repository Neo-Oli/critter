import { beforeEach, describe, expect, it, vi } from 'vitest'

import { high, low, max } from '../config.ts'
import { Critter } from '../critter.ts'
import { plain } from '../plain.ts'
import { hour } from '../utils.ts'

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
    it('matches snapshots across key life stages', () => {
        const stages: Record<string, () => Critter> = {
            dead: () => makeCritter({ alive: false, mood: ['dead'] }),
            debug: () =>
                makeCritter({
                    energy: 345678,
                    happiness: 123456,
                    health: 456789,
                    satiety: 234567,
                    toilet: 567890,
                }),
            eating: () =>
                makeCritter({
                    action: 'eating',
                    actionTime: 45,
                    age: 30,
                    energy: high,
                    happiness: high,
                    health: max,
                    satiety: high,
                }),
            healing: () =>
                makeCritter({
                    action: 'healing',
                    actionTime: 10,
                    health: low,
                }),
            hungry: () => makeCritter({ mood: ['hungry'], satiety: low }),
            ill: () => makeCritter({ health: low - 1, mood: ['sick'] }),
            playing: () =>
                makeCritter({
                    action: 'playing',
                    actionTime: 2 * 60,
                    mood: ['happy'],
                }),
            poo: () => makeCritter({ poo: true }),
            refusing: () =>
                makeCritter({
                    action: 'refusing',
                    actionTime: 30,
                    age: 3600,
                    happiness: max,
                    satiety: high + 1,
                }),
            sad: () => makeCritter({ happiness: low, mood: ['sad'] }),
            sick: () => makeCritter({ health: low, mood: ['sick'] }),
            sleeping: () =>
                makeCritter({
                    action: 'sleeping',
                    actionTime: 1800,
                    age: 8 * hour,
                    energy: low,
                    happiness: high,
                }),
            tired: () => makeCritter({ energy: low, mood: ['tired'] }),
        }

        for (const [stage, create] of Object.entries(stages)) {
            expect(
                create().plain({
                    debug: stage === 'debug',
                    noNerdFonts: false,
                }),
            ).toMatchSnapshot(stage)
        }
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

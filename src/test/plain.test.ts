import { beforeEach, describe, expect, it, vi } from 'vitest'

import { happinessPenalty, high, low, max, normal } from '../config.ts'
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

const full = String.fromCodePoint(0x25cf)
const half = String.fromCodePoint(0x25d0)
const empty = String.fromCodePoint(0x25cb)
const render = (overrides: Partial<Parameters<typeof plain>[0]> = {}) =>
    plain({
        actionTime: 0,
        age: 0,
        cleanliness: max,
        energy: max,
        happiness: max,
        health: max,
        noNerdFonts: true,
        satiety: max,
        state: 'idle',
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
            newborn: () => makeCritter(),
            eating: () =>
                makeCritter({
                    action: 'eating',
                    actionTime: 45,
                    age: 30,
                    cleanliness: high,
                    energy: high,
                    happiness: high,
                    health: max,
                    satiety: high,
                }),
            refusing: () =>
                makeCritter({
                    action: 'refusing',
                    actionTime: 30,
                    age: 3600,
                    happiness: max - happinessPenalty,
                    satiety: high + 1,
                }),
            sleeping: () =>
                makeCritter({
                    action: 'sleeping',
                    actionTime: 1800,
                    age: 8 * hour,
                    energy: low,
                    happiness: high,
                }),
            neglected: () =>
                makeCritter({
                    age: 2 * 24 * hour,
                    cleanliness: 0,
                    energy: 0,
                    happiness: low - 1,
                    health: low - 1,
                    mood: ['sick', 'sad', 'hungry', 'dirty', 'tired'],
                    satiety: 0,
                }),
        }

        for (const [stage, create] of Object.entries(stages)) {
            expect(create().plain({ noNerdFonts: false })).toMatchSnapshot(
                stage,
            )
        }
    })

    it.each([
        'cleaning',
        'dead',
        'dirty',
        'eating',
        'happy',
        'healing',
        'hungry',
        'idle',
        'playing',
        'refusing',
        'sad',
        'sick',
        'sleeping',
        'tired',
    ] as const)('loads the %s sprite and displays every stat', (state) => {
        const output = render({ state })
        expect(output).toContain(state.toUpperCase())
        for (const label of [
            'Happy',
            'Hunger',
            'Energy',
            'Health',
            'Clean',
            'Age',
        ]) {
            expect(output).toContain(`${label}:`)
        }
        expect(output).not.toContain('undefined')
        expect(output).not.toContain('\r')
        expect(output.split('\n').length).toBeGreaterThanOrEqual(7)
    })

    it('renders zero, half-segment, and full bars with five positions', () => {
        const output = render({ energy: max / 10, happiness: 0 })
        expect(output).toContain(`Happy:  ${empty.repeat(5)}`)
        expect(output).toContain(`Energy: ${half}${empty.repeat(4)}`)
        expect(output).toContain(`Health: ${full.repeat(5)}`)
    })

    it('caps an over-range stat bar without an overflow marker', () => {
        const output = render({ satiety: max + 1 })
        expect(output).toContain(`Hunger: ${full.repeat(5)}`)
        expect(output).not.toContain('!')
    })

    it('uses private-use Nerd Font glyphs only when enabled', () => {
        expect(render({ noNerdFonts: false })).toMatch(/\p{Co}/u)
        expect(render()).not.toMatch(/\p{Co}/u)
    })

    it('shows action time and age using the duration helper', () => {
        const output = render({
            actionTime: 7200,
            age: 172800,
            state: 'sleeping',
        })
        expect(output).toContain('SLEEPING (2 hours)')
        expect(output).toContain('Age:    2 days')
        expect(render()).toContain('IDLE\n')
    })
})

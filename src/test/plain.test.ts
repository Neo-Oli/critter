import { describe, expect, it } from 'vitest'

import { max } from '../config.ts'
import { plain } from '../plain.ts'

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

describe('plain rendering', () => {
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

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    happinessPenalty,
    high,
    low,
    max,
    normal,
    schedules,
} from '../config.ts'
import { Critter } from '../critter.ts'
import { minute } from '../utils.ts'

const runtime = vi.hoisted(() => ({ speed: 1, time: 1000000 }))
const storage = vi.hoisted(() => ({ loadState: vi.fn(), saveState: vi.fn() }))

vi.mock('../config.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../config.ts')>()),
    get speed() {
        return runtime.speed
    },
}))
vi.mock('../io.ts', () => storage)
vi.mock('../utils.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils.ts')>()),
    now: () => runtime.time,
}))

const healthy = () => {
    const pet = new Critter({ command: 'new' })
    pet.toilet = max
    pet.energy = max
    pet.happiness = max
    pet.health = max
    pet.satiety = high
    return pet
}

beforeEach(() => {
    runtime.speed = 1
    runtime.time = 1000000
    storage.loadState.mockReset()
    storage.saveState.mockReset()
})

describe('construction and persistence', () => {
    it('creates a new pet and persists its state', () => {
        const pet = new Critter({ command: 'new' })
        expect(pet.birth).toBe(runtime.time)
        expect(pet.alive).toBe(true)
        expect(pet.satiety).toBe(normal)
        expect(pet.toilet).toBe(low)
        expect(storage.saveState).toHaveBeenCalledWith(pet.persistedState())
    })

    it('restores the saved state before processing commands', () => {
        const original = healthy()
        original.feed()
        const state = original.persistedState()
        storage.loadState.mockReturnValue(state)
        runtime.time += 10
        const restored = new Critter({ command: 'play' })
        expect(restored.birth).toBe(state.birth)
        expect(restored.age).toBe(state.age + 10)
        expect(restored.action).toBe('playing')
        expect(restored.actionTime).toBe(2 * minute)
    })

    it('rounds restored stat values to integers', () => {
        storage.loadState.mockReturnValue({
            birth: runtime.time,
            energy: 120.4,
            happiness: 345.6,
            health: 789.2,
            satiety: 456.7,
            time: runtime.time,
            toilet: 987.8,
        })

        const pet = new Critter({})

        expect(pet.energy).toBe(120)
        expect(pet.happiness).toBe(346)
        expect(pet.health).toBe(789)
        expect(pet.satiety).toBe(457)
        expect(pet.toilet).toBe(988)
    })

    it('refreshes moods even when no time has elapsed', () => {
        const pet = healthy()
        pet.satiety = low - 1
        pet.health = low - 1
        pet.energy = low - 1
        pet.happiness = low - 1
        pet.process()
        expect(pet.mood).toEqual(['hungry', 'sick', 'tired', 'sad'])
    })

    it('shows sick body art below normal and ill top art below low', () => {
        const pet = healthy()
        expect(pet.getCritterState().top).toBe('none')
        expect(pet.getCritterState().sprite).not.toBe('sick')

        pet.health = normal - 1
        pet.updateMood()
        expect(pet.getCritterState().sprite).toBe('sick')
        expect(pet.getCritterState().top).toBe('none')

        pet.health = low
        pet.updateMood()
        expect(pet.getCritterState().sprite).toBe('sick')
        expect(pet.getCritterState().top).toBe('none')

        pet.health = low - 1
        pet.updateMood()
        expect(pet.getCritterState().sprite).toBe('sick')
        expect(pet.getCritterState().top).toBe('ill')

        pet.action = 'healing'
        expect(pet.getCritterState().main).toBe('healing')
        expect(pet.getCritterState().sprite).toBe('sick')
        expect(pet.getCritterState().top).toBe('medicine')
    })
})

describe('actions', () => {
    it('refuses meals above the high threshold with a small happiness loss', () => {
        const pet = healthy()
        pet.satiety = high + 1
        const before = pet.happiness
        pet.feed()
        expect(pet.action).toBe('refusing')
        expect(pet.actionTime).toBe(30)
        expect(before - pet.happiness).toBe(happinessPenalty)
    })

    it('refuses sleep at or above normal energy and allows it below normal', () => {
        const rested = healthy()
        rested.sleep()
        expect(rested.action).toBe('refusing')
        expect(rested.actionTime).toBe(30)

        const tired = healthy()
        tired.energy = normal - 1
        tired.sleep()
        expect(tired.action).toBe('sleeping')
        expect(tired.actionTime).toBe(schedules.energy.sleeping)
    })

    it('cleans up the toilet and clears the poo flag', () => {
        const pet = healthy()
        pet.poo = true
        pet.clean()
        expect(pet.poo).toBe(false)
    })
})

describe('bathroom schedule', () => {
    it('updates the toilet drain faster at higher satiety', () => {
        const highPet = healthy()
        highPet.satiety = high + 1
        const normalPet = healthy()
        normalPet.satiety = normal + 1
        const lowPet = healthy()
        lowPet.satiety = low + 1

        runtime.time += 1
        highPet.process()
        normalPet.process()
        lowPet.process()

        expect(highPet.toilet).toBeLessThan(normalPet.toilet)
        expect(normalPet.toilet).toBeLessThan(lowPet.toilet)
    })

    it('triggers a bathroom trip once the toilet reaches zero', () => {
        const pet = healthy()
        pet.toilet = 0
        runtime.time += 1
        pet.process()
        expect(pet.poo).toBe(true)
        expect(pet.toilet).toBe(max)
    })

    it('does not modify the toilet when satiety is zero', () => {
        const pet = healthy()
        pet.satiety = 0
        pet.toilet = max + 1
        runtime.time += 1
        pet.process()
        expect(pet.poo).toBe(false)
        expect(pet.toilet).toBe(max + 1)
    })
})

describe('rendering', () => {
    it('renders the current state and keeps the top sprite as a blank placeholder', () => {
        const pet = healthy()
        pet.action = 'playing'
        pet.mood = ['happy']
        const output = pet.plain({ noNerdFonts: true })
        expect(output).toContain('PLAYING')
        expect(output).toContain('Toilet:')
        expect(output).not.toContain('undefined')
    })

    it('adds the raw values in debug mode', () => {
        const pet = healthy()
        pet.happiness = 123456
        const output = pet.plain({ debug: true, noNerdFonts: true })
        expect(output).toContain('(123456)')
    })
})

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
import { day, hour, minute } from '../utils.ts'

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

const advance = (pet: Critter, seconds: number) => {
    runtime.time += seconds
    pet.process()
}

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

    it('refreshes moods even when no time has elapsed', () => {
        const pet = healthy()
        pet.satiety = low - 1
        pet.health = low - 1
        pet.energy = low - 1
        pet.happiness = low - 1
        pet.process()
        expect(pet.mood).toEqual(['hungry', 'sick', 'tired', 'sad'])
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
        advance(pet, 30)
        expect(pet.action).toBe('idle')
    })

    it('refuses sleep at or above normal energy and wakes automatically at max', () => {
        const rested = healthy()
        rested.sleep()
        expect(rested.action).toBe('refusing')
        expect(rested.actionTime).toBe(30)

        const tired = healthy()
        tired.energy = normal - 1
        tired.sleep()
        expect(tired.action).toBe('sleeping')
        expect(tired.actionTime).toBe(schedules.energy.sleeping)

        const nap = healthy()
        nap.energy = max - 1
        nap.action = 'sleeping'
        nap.actionTime = 1
        advance(nap, 1)
        expect(nap.energy).toBe(max)
        expect(nap.action).toBe('idle')
        expect(nap.actionTime).toBe(0)
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
        runtime.time += 1
        normalPet.process()
        runtime.time += 1
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

describe('stat schedules', () => {
    it('drains energy once per day and fully over ten play sessions', () => {
        const daily = healthy()
        daily.satiety = max
        advance(daily, 1)
        expect(daily.energy).toBeCloseTo(max - max / day)

        const playing = healthy()
        for (let session = 0; session < 10; session += 1) {
            playing.play()
            advance(playing, 2 * minute)
        }
        expect(playing.energy).toBe(0)
    })

    it('drains satiety three times daily and fully over five play sessions', () => {
        const daily = healthy()
        daily.satiety = max
        advance(daily, 1)
        expect(daily.satiety).toBeCloseTo(max - max / (day / 3))

        const playing = healthy()
        for (let session = 0; session < 5; session += 1) {
            playing.play()
            advance(playing, 2 * minute)
        }
        expect(playing.satiety).toBe(0)
    })

    it('decays happiness to zero in six hours', () => {
        const pet = healthy()
        pet.happiness = max
        advance(pet, 1)
        expect(pet.happiness).toBeCloseTo(max - max / (6 * hour))
    })

    it('takes two healing actions to restore a fully depleted health stat', () => {
        const pet = healthy()
        pet.health = 1
        pet.satiety = 0
        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBe(max / 2 + 1)
        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBe(max)
    })

    it('stacks poo with hunger and starving health loss', () => {
        const hungry = healthy()
        hungry.satiety = low - 1
        advance(hungry, 1)
        expect(hungry.health).toBeCloseTo(max - max / schedules.health.hungry)

        const soiled = healthy()
        soiled.poo = true
        advance(soiled, 1)
        expect(soiled.health).toBeCloseTo(max - max / schedules.health.poo)

        const combined = healthy()
        combined.satiety = low - 1
        combined.poo = true
        advance(combined, 1)
        expect(combined.health).toBeCloseTo(
            max - max / schedules.health.poo - max / schedules.health.hungry,
        )

        const starving = healthy()
        starving.satiety = 0
        advance(starving, 1)
        expect(starving.health).toBeCloseTo(
            max - max / schedules.health.starving,
        )

        const pooAndStarving = healthy()
        pooAndStarving.satiety = 0
        pooAndStarving.poo = true
        advance(pooAndStarving, 1)
        expect(pooAndStarving.health).toBeCloseTo(
            max - max / schedules.health.poo - max / schedules.health.starving,
        )
    })

    it('recovers health in six hours when fed and clean', () => {
        const pet = healthy()
        pet.health = max - 1
        for (let hourIndex = 0; hourIndex < 6; hourIndex += 1) {
            pet.satiety = max
            advance(pet, hour)
        }
        expect(pet.health).toBe(max)
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

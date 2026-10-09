import { beforeEach, describe, expect, it, vi } from 'vitest'

import { high, low, max, normal, too_high } from './config.ts'
import { Critter } from './critter.ts'
import { hour, minute } from './utils.ts'

const runtime = vi.hoisted(() => ({ speed: 1, time: 1000000 }))
const storage = vi.hoisted(() => ({ loadState: vi.fn(), saveState: vi.fn() }))

vi.mock('./config.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('./config.ts')>()),
    get speed() {
        return runtime.speed
    },
}))
vi.mock('./io.ts', () => storage)
vi.mock('./utils.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('./utils.ts')>()),
    now: () => runtime.time,
}))

const advance = (pet: Critter, seconds: number) => {
    runtime.time += seconds
    pet.process()
}

const healthy = () => {
    const pet = new Critter({ command: 'new' })
    pet.cleanliness = max
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
    it('creates a new pet instead of restoring an old save', () => {
        storage.loadState.mockReturnValue({ age: 999, birth: 100, health: 0 })
        const pet = new Critter({ command: 'new' })
        expect(pet.birth).toBe(runtime.time)
        expect(pet.age).toBe(0)
        expect(pet.alive).toBe(true)
        expect(pet.satiety).toBe(normal)
        expect(storage.saveState).toHaveBeenCalledWith(pet.persistedState())
    })

    it('reports a missing pet without writing a save', () => {
        expect(new Critter({}).error).toBe('No Critter')
        expect(storage.saveState).not.toHaveBeenCalled()
    })

    it('handles an unreadable save', () => {
        storage.loadState.mockImplementation(() => {
            throw new Error('bad save')
        })
        expect(new Critter({}).error).toBe('No Critter')
        expect(storage.saveState).not.toHaveBeenCalled()
    })

    it('restores every persisted field and processes time before a command', () => {
        const original = healthy()
        original.feed()
        const state = original.persistedState()
        storage.loadState.mockReturnValue(state)
        runtime.time += 10
        const restored = new Critter({ command: 'play' })
        expect(restored.birth).toBe(state.birth)
        expect(restored.age).toBe(state.age + 10)
        expect(restored.satiety).toBe(Math.min(max, state.satiety + 62500))
        expect(restored.action).toBe('playing')
        expect(restored.actionTime).toBe(2 * minute)
        expect(storage.saveState).toHaveBeenLastCalledWith(
            restored.persistedState(),
        )
    })

    it('round trips an unfinished hungry meal without extra save fields', () => {
        const original = healthy()
        original.satiety = low - 1
        original.feed()
        advance(original, 30)
        const state = original.persistedState()
        storage.loadState.mockReturnValue(state)
        const restored = new Critter({})
        expect(restored.persistedState()).toEqual(state)
        advance(restored, restored.actionTime)
        expect(restored.satiety).toBeLessThanOrEqual(high)
        expect(high - restored.satiety).toBeLessThan(6250)
        expect(Object.keys(state).sort()).toEqual([
            'action',
            'actionTime',
            'age',
            'birth',
            'cleanliness',
            'energy',
            'happiness',
            'health',
            'satiety',
            'time',
        ])
    })
})

describe('actions', () => {
    it.each([
        ['clean', 'cleaning', minute],
        ['feed', 'eating', minute],
        ['medicine', 'healing', 10],
        ['play', 'playing', 2 * minute],
        ['sleep', 'sleeping', 2 * hour],
        ['stop', 'idle', 0],
    ] as const)('dispatches the %s command', (command, action, duration) => {
        storage.loadState.mockReturnValue(healthy().persistedState())
        const pet = new Critter({ command })
        expect(pet.action).toBe(action)
        expect(pet.actionTime).toBe(duration)
    })

    it.each([0, 1, 123456, low - 1])(
        'feeds hungry satiety %i without exceeding high',
        (satiety) => {
            const pet = healthy()
            pet.satiety = satiety
            pet.feed()
            expect(Number.isInteger(pet.actionTime)).toBe(true)
            advance(pet, pet.actionTime)
            expect(pet.satiety).toBeLessThanOrEqual(high)
            expect(high - pet.satiety).toBeLessThan(6250)
            expect(pet.mood).not.toContain('stuffed')
            expect(pet.action).toBe('idle')
        },
    )

    it('allows a newborn meal but punishes repeated overfeeding', () => {
        const pet = new Critter({ command: 'new' })
        advance(pet, 1)
        expect(pet.mood).not.toContain('hungry')
        pet.feed()
        advance(pet, minute)
        expect(pet.satiety).toBeLessThanOrEqual(too_high)
        expect(pet.mood).not.toContain('stuffed')
        pet.feed()
        advance(pet, minute)
        expect(pet.satiety).toBe(max)
        expect(pet.mood).toContain('stuffed')
        expect(pet.health).toBeLessThan(high)
    })

    it.each([
        ['clean', 'cleanliness', minute],
        ['play', 'happiness', 2 * minute],
        ['sleep', 'energy', 2 * hour],
    ] as const)(
        '%s replenishes its stat and finishes on time',
        (action, stat, duration) => {
            const pet = healthy()
            pet[stat] = 0
            pet[action]()
            advance(pet, duration)
            expect(pet[stat]).toBeGreaterThanOrEqual(max - duration)
            expect(pet[stat]).toBeLessThanOrEqual(max)
            expect(pet.actionTime).toBe(0)
            expect(pet.action).toBe('idle')
        },
    )

    it('medicine restores health', () => {
        const pet = healthy()
        pet.health = low
        pet.medicine()
        advance(pet, 10)
        expect(pet.health).toBe(low + 100000)
        expect(pet.action).toBe('idle')
    })

    it.each(['feed', 'sleep', 'play'] as const)(
        'stops %s with only the intended happiness penalty',
        (action) => {
            const pet = healthy()
            pet[action]()
            pet.stop()
            expect(pet.action).toBe('idle')
            expect(pet.actionTime).toBe(0)
            expect(pet.happiness).toBe(action === 'play' ? max : max - 1000)
        },
    )
})

describe('processing and presentation', () => {
    it('does not process the same time twice', () => {
        const pet = healthy()
        advance(pet, minute)
        const state = pet.persistedState()
        pet.process()
        expect(pet.persistedState()).toEqual(state)
    })

    it('clamps stats at zero and automatically sleeps without exhaustion damage', () => {
        const pet = healthy()
        pet.satiety = 1
        pet.energy = 1
        pet.happiness = 1
        pet.cleanliness = 1
        advance(pet, 1)
        expect(pet.satiety).toBe(0)
        expect(pet.energy).toBe(0)
        expect(pet.happiness).toBe(0)
        expect(pet.cleanliness).toBe(0)
        expect(pet.health).toBe(max - 14)
        expect(pet.action).toBe('sleeping')
    })

    it('detects death even when no time has elapsed', () => {
        const pet = healthy()
        pet.health = 0
        pet.process()
        expect(pet.alive).toBe(false)
        expect(pet.mood).toEqual(['dead'])
        expect(pet.action).toBe('idle')
        expect(pet.actionTime).toBe(0)
        expect(pet.getCritterState()).toBe('dead')
        advance(pet, hour)
        expect(pet.health).toBe(0)
        expect(pet.age).toBe(0)
    })

    it('prioritizes actions, then moods, but never actions over death', () => {
        const pet = healthy()
        expect(pet.getCritterState()).toBe('idle')
        pet.mood = [
            'happy',
            'sad',
            'dirty',
            'hungry',
            'stuffed',
            'tired',
            'sick',
        ]
        expect(pet.getCritterState()).toBe('sick')
        pet.play()
        expect(pet.getCritterState()).toBe('playing')
        pet.die()
        expect(pet.getCritterState()).toBe('dead')
    })

    it('renders its current state and action duration', () => {
        const pet = healthy()
        pet.play()
        const output = pet.plain({ noNerdFonts: true })
        expect(output).toContain('PLAYING (2 minutes)')
        expect(output).toContain('Health:')
        expect(output).toContain('Age:')
    })

    it('produces the same stats at normal and accelerated speeds', () => {
        const normalPet = healthy()
        advance(normalPet, hour)
        const fastPet = healthy()
        runtime.speed = hour
        advance(fastPet, 1)
        for (const field of [
            'age',
            'action',
            'actionTime',
            'satiety',
            'health',
            'energy',
            'happiness',
            'cleanliness',
            'mood',
        ] as const) {
            expect(fastPet[field]).toEqual(normalPet[field])
        }
    })
})

describe('accelerated balance', () => {
    it.each([
        ['tired', 9, 10],
        ['sad', 7, 9],
        ['dirty', 22, 24],
    ] as const)(
        'needs care for %s in its target range',
        (mood, before, after) => {
            const pet = healthy()
            runtime.speed = hour
            advance(pet, before)
            expect(pet.mood).not.toContain(mood)
            advance(pet, after - before)
            expect(pet.mood).toContain(mood)
        },
    )

    it('needs another meal about six hours after feeding while hungry', () => {
        const pet = healthy()
        pet.satiety = low - 1
        pet.feed()
        advance(pet, pet.actionTime)
        expect(pet.satiety).toBeLessThanOrEqual(high)
        runtime.speed = hour
        advance(pet, 5)
        expect(pet.mood).not.toContain('hungry')
        advance(pet, 2)
        expect(pet.mood).toContain('hungry')
    })

    it('gets sick around one day and dies around two days without food', () => {
        const pet = healthy()
        runtime.speed = hour
        advance(pet, 23)
        expect(pet.health).toBeGreaterThanOrEqual(low)
        advance(pet, 2)
        expect(pet.mood).toContain('sick')
        expect(pet.alive).toBe(true)
        advance(pet, 21)
        expect(pet.alive).toBe(true)
        advance(pet, 4)
        expect(pet.alive).toBe(false)
        expect(pet.getCritterState()).toBe('dead')
        expect(pet.age / hour).toBeGreaterThanOrEqual(46)
        expect(pet.age / hour).toBeLessThanOrEqual(50)
    })

    it('four meals per day alone keep it alive for a week', () => {
        const pet = healthy()
        pet.satiety = normal
        runtime.speed = minute
        for (let elapsed = 0; elapsed < 7 * 24 * 60; elapsed += 1) {
            if (elapsed % (6 * 60) === 0) pet.feed()
            advance(pet, 1)
            if (!pet.alive)
                throw new Error(`Died at simulated minute ${elapsed}`)
        }
        expect(pet.health).toBe(max)
        expect(pet.age).toBe(7 * 24 * hour)
    })

    it('the full daily care schedule keeps it healthy for ten days', () => {
        const pet = healthy()
        pet.satiety = normal
        runtime.speed = minute
        for (let elapsed = 0; elapsed < 10 * 24 * 60; elapsed += 1) {
            const dayMinute = elapsed % (24 * 60)
            if (dayMinute % (6 * 60) === 0) {
                pet.feed()
            }
            if (dayMinute % (8 * 60) === 5) {
                pet.play()
            }
            if (dayMinute === 10) {
                pet.clean()
            }
            if (dayMinute === 10 * 60 || dayMinute === 22 * 60) {
                pet.sleep()
            }
            advance(pet, 1)
            if (!pet.alive || pet.mood.includes('stuffed')) {
                throw new Error(
                    `Care schedule failed at simulated minute ${elapsed}`,
                )
            }
        }
        expect(pet.health).toBe(max)
        expect(pet.age).toBe(10 * 24 * hour)
        expect(pet.cleanliness).toBeGreaterThan(low - 30000)
        expect(pet.happiness).toBeGreaterThan(low)
        expect(pet.energy).toBeGreaterThan(low)
    })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { normal, stagingSchedule } from '../config.ts'
import { Critter } from '../lib.ts'

const runtime = vi.hoisted(() => ({ time: 1000000 }))
const storage = vi.hoisted(() => ({ loadState: vi.fn(), saveState: vi.fn() }))

vi.mock('../io.ts', () => storage)
vi.mock('../utils.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils.ts')>()),
    now: () => runtime.time,
}))

const adult = () => ({
    age: stagingSchedule.stage0,
    birth: runtime.time - stagingSchedule.stage0,
    satiety: normal,
    time: runtime.time,
})

beforeEach(() => {
    runtime.time = 1000000
    storage.loadState.mockReset()
    storage.saveState.mockReset()
})

describe('library api', () => {
    it('throws when there is no saved critter', () => {
        expect(() => new Critter()).toThrow('No Critter')
    })

    it('uses browser storage by default', () => {
        storage.loadState.mockReturnValue(adult())
        new Critter().status()
        expect(storage.loadState).toHaveBeenCalledWith(true)
        expect(storage.saveState).toHaveBeenLastCalledWith(
            expect.any(Object),
            true,
        )
    })

    it('passes browser: false through to storage', () => {
        storage.loadState.mockReturnValue(adult())
        new Critter({ browser: false }).status()
        expect(storage.loadState).toHaveBeenCalledWith(false)
        expect(storage.saveState).toHaveBeenLastCalledWith(
            expect.any(Object),
            false,
        )
    })

    it('creates a new critter without needing a save', () => {
        storage.saveState.mockImplementation((state) =>
            storage.loadState.mockReturnValue(state),
        )
        const data = Critter.create({ browser: false }).status()
        expect(data.action).toBe('idle')
        expect(storage.loadState).toHaveBeenCalledWith(false)
    })

    it('reports whether a living critter is saved', () => {
        expect(Critter.isAlive()).toBe(false)
        storage.loadState.mockReturnValue(adult())
        expect(Critter.isAlive()).toBe(true)
        storage.loadState.mockReturnValue({ ...adult(), health: 0 })
        expect(Critter.isAlive({ browser: false })).toBe(false)
        expect(storage.loadState).toHaveBeenLastCalledWith(false)
    })

    it('keeps the critter in memory between actions', () => {
        storage.loadState.mockReturnValue(adult())
        const critter = new Critter()
        expect(critter.feed().action).toBe('eating')
        runtime.time += 10
        expect(critter.stop().action).toBe('idle')
        expect(storage.loadState).toHaveBeenCalledTimes(1)
    })

    it('returns the same shape as the json output', () => {
        storage.loadState.mockReturnValue(adult())
        const data = new Critter({ debug: true }).status()
        expect(Object.keys(data)).toHaveLength(20)
        expect(data.plainStats).toMatch(/\(\d+\)/)
    })
})

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

    it.each([0, 1, 2] as const)('creates a critter at stage %i', (stage) => {
        storage.saveState.mockImplementation((state) =>
            storage.loadState.mockReturnValue(state),
        )
        const critter = Critter.create({ stage })
        const age =
            stage === 0
                ? 0
                : stagingSchedule.stage0 +
                  (stage === 2 ? stagingSchedule.stage1 : 0)

        expect(storage.saveState).toHaveBeenLastCalledWith(
            expect.objectContaining({
                age,
                birth: runtime.time - age,
                satiety: normal,
                time: runtime.time,
            }),
            true,
        )
        expect(critter.feed().action).toBe(stage === 0 ? 'idle' : 'eating')
        expect(new Critter().status().action).toBe(
            stage === 0 ? 'idle' : 'eating',
        )
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

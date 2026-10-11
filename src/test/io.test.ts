import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PersistedCritterState } from '../critter.ts'

import { binName, high, low, max, normal } from '../config.ts'

let home: string
let statePath: string
let storage: typeof import('../io.ts')
const state: PersistedCritterState = {
    action: 'idle',
    actionTime: 0,
    age: 0,
    birth: 1000000,
    cleanliness: low,
    energy: normal,
    happiness: max,
    health: high,
    satiety: normal,
    time: 1000000,
}

beforeEach(async () => {
    home = mkdtempSync(join(tmpdir(), 'critter-io-test-'))
    statePath = join(home, '.local', 'share', binName, 'state.json')
    vi.stubEnv('HOME', home)
    vi.resetModules()
    storage = await import('../io.ts')
})

afterEach(() => {
    vi.unstubAllEnvs()
    rmSync(home, { force: true, recursive: true })
})

describe('isolated state storage', () => {
    it('returns undefined when there is no save', () => {
        expect(storage.loadState()).toBeUndefined()
        expect(existsSync(statePath)).toBe(false)
    })

    it('creates parent directories and round trips all state', () => {
        storage.saveState(state)
        expect(existsSync(statePath)).toBe(true)
        expect(storage.loadState()).toEqual(state)
    })

    it('overwrites the previous state', () => {
        storage.saveState(state)
        storage.saveState({
            ...state,
            action: 'sleeping',
            actionTime: 7200,
            age: 100,
        })
        expect(storage.loadState()).toEqual({
            ...state,
            action: 'sleeping',
            actionTime: 7200,
            age: 100,
        })
    })

    it('loads partial legacy state', () => {
        storage.saveState(state)
        writeFileSync(statePath, JSON.stringify({ birth: state.birth }))
        expect(storage.loadState()).toEqual({ birth: state.birth })
    })

    it('does not silently swallow malformed JSON', () => {
        storage.saveState(state)
        writeFileSync(statePath, '{invalid json')
        expect(() => storage.loadState()).toThrow(SyntaxError)
    })

    it('propagates filesystem errors other than a missing file', () => {
        mkdirSync(statePath, { recursive: true })
        expect(() => storage.loadState()).toThrow()
        expect(() => storage.saveState(state)).toThrow()
    })
})

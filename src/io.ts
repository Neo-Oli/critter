import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import type { PersistedCritterState } from './critter.ts'

import { binName } from './config.ts'

type Exact<T, Shape> = Record<Exclude<keyof T, keyof Shape>, never> & T

const path = `${process.env.HOME}/.local/share/${binName}/state.json`

export const loadState = (): Partial<PersistedCritterState> | undefined => {
    try {
        return JSON.parse(
            readFileSync(path, 'utf8'),
        ) as Partial<PersistedCritterState>
    } catch (error) {
        if (
            !(error instanceof Error) ||
            !('code' in error) ||
            error.code !== 'ENOENT'
        )
            throw error
    }
}

export const saveState = <State extends PersistedCritterState>(
    state: Exact<State, PersistedCritterState>,
) => {
    mkdirSync(path.substring(0, path.lastIndexOf('/')), { recursive: true })
    writeFileSync(path, JSON.stringify(state, null, 4))
}

import type { PersistedCritterState } from './critter.ts'

import { binName } from './config.ts'

type Exact<T, Shape> = Record<Exclude<keyof T, keyof Shape>, never> & T

// Loaded lazily so browser bundles never touch node:fs or process.
const fs = () => process.getBuiltinModule('node:fs')
const path = () => `${process.env.HOME}/.local/share/${binName}/state.json`

export const loadState = (
    browser = false,
): Partial<PersistedCritterState> | undefined => {
    if (browser) {
        const saved = localStorage.getItem(binName)
        return saved === null
            ? undefined
            : (JSON.parse(saved) as Partial<PersistedCritterState>)
    }
    try {
        return JSON.parse(
            fs().readFileSync(path(), 'utf8'),
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
    browser = false,
) => {
    if (browser) {
        localStorage.setItem(binName, JSON.stringify(state))
        return
    }
    const file = path()
    fs().mkdirSync(file.substring(0, file.lastIndexOf('/')), {
        recursive: true,
    })
    fs().writeFileSync(file, JSON.stringify(state, null, 4))
}

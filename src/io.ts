import { binName } from './config.ts'
import type { Critter } from './critter.ts'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const path = `${process.env.HOME}/.local/share/${binName}/state.json`

export const loadState = () => {
    try {
        return JSON.parse(readFileSync(path, 'utf8'))
    } catch (error) {
        if (
            !(error instanceof Error) ||
            !('code' in error) ||
            error.code !== 'ENOENT'
        )
            throw error
    }
}

export const saveState = (state: ReturnType<Critter['state']>) => {
    mkdirSync(path.substring(0, path.lastIndexOf('/')), { recursive: true })
    writeFileSync(path, JSON.stringify(state, null, 4))
}

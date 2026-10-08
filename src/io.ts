import { binName } from './config.ts'
import { Critter } from './critter.ts'
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

export const saveState = (critter: Critter) => {
    mkdirSync(path.substring(0, path.lastIndexOf('/')), { recursive: true })
    writeFileSync(path, JSON.stringify(critter.state(), null, 4))
}

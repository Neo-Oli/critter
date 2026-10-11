import { buildSync } from 'esbuild'
import { spawnSync } from 'node:child_process'
import {
    existsSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest'

import { low, max, stagingSchedule } from '../config.ts'

let bundleDirectory: string
let entry: string
let home: string

const run = (...args: string[]) =>
    spawnSync(process.execPath, [entry, ...args], {
        encoding: 'utf8',
        env: { ...process.env, HOME: home },
        timeout: 10000,
    })
const statePath = () => join(home, '.local', 'share', 'critter', 'state.json')
const advancePetToStageOne = () => {
    const state = JSON.parse(readFileSync(statePath(), 'utf8'))
    state.age = stagingSchedule.stage0
    writeFileSync(statePath(), JSON.stringify(state))
}

beforeAll(() => {
    bundleDirectory = mkdtempSync(join(tmpdir(), 'critter-cli-bundle-'))
    entry = join(bundleDirectory, 'cli.mjs')
    buildSync({
        bundle: true,
        entryPoints: [fileURLToPath(new URL('../index.ts', import.meta.url))],
        format: 'esm',
        loader: { '.txt': 'text' },
        outfile: entry,
        platform: 'node',
    })
})

beforeEach(() => {
    home = mkdtempSync(join(tmpdir(), 'critter-cli-home-'))
})

afterEach(() => {
    rmSync(home, { force: true, recursive: true })
})

afterAll(() => {
    rmSync(bundleDirectory, { force: true, recursive: true })
})

describe('CLI and entry point', () => {
    it.each([1, 2] as const)(
        'renders short conditions from saved stage %i state in both font modes',
        (stage) => {
            expect(run('new').status).toBe(0)
            const saved = JSON.parse(readFileSync(statePath(), 'utf8'))
            const fixtures = [
                { health: low - 1, poo: false },
                { health: max, poo: true },
                { health: low - 1, poo: true },
                {
                    command: 'medicine',
                    health: low - 1,
                    poo: true,
                },
            ]
            for (const fixture of fixtures) {
                for (const noNerdFonts of [true, false]) {
                    writeFileSync(
                        statePath(),
                        JSON.stringify({
                            ...saved,
                            action: 'idle',
                            actionTime: 0,
                            age:
                                stagingSchedule.stage0 +
                                (stage === 2 ? stagingSchedule.stage1 : 0),
                            energy: max,
                            happiness: max,
                            health: fixture.health,
                            poo: fixture.poo,
                            satiety: max,
                            time: Math.floor(Date.now() / 1000) + 3600,
                            toilet: max,
                        }),
                    )
                    const result = run(
                        '--short',
                        ...(noNerdFonts ? ['--no-nerd-fonts'] : []),
                        ...(fixture.command ? [fixture.command] : []),
                    )
                    expect(result.error).toBeUndefined()
                    expect(result.status).toBe(0)
                    expect(result.stderr).toBe('')
                    expect(result.stdout.trim()).not.toBe('')
                    expect(result.stdout.trim().split('\n')).toHaveLength(1)
                    const persisted = JSON.parse(
                        readFileSync(statePath(), 'utf8'),
                    )
                    expect(persisted.poo).toBe(fixture.poo)
                    expect(persisted.action).toBe(
                        fixture.command ? 'healing' : 'idle',
                    )
                }
            }
        },
    )

    it.each(['-s', '--short'])('prints only the state with %s', (flag) => {
        const created = run(flag, '-n', 'new')
        expect(created.status).toBe(0)
        expect(created.stdout.trim()).not.toBe('')
        expect(created.stdout).not.toContain('Age:')
        advancePetToStageOne()
        const playing = run('play', flag)
        expect(playing.status).toBe(0)
        expect(playing.stdout.trim()).not.toBe('')
        expect(playing.stdout).not.toContain('Happy:')
        expect(playing.stderr).toBe('')
        const unicode = run(flag, '-d', '-n')
        expect(unicode.status).toBe(0)
        expect(unicode.stdout.trim()).not.toBe('')
        expect(unicode.stdout.trim().split('\n')).toHaveLength(1)
    })

    it.each(['-h', '--help'])(
        'prints help for %s without creating a pet',
        (flag) => {
            const result = run(flag)
            expect(result.error).toBeUndefined()
            expect(result.status).toBe(0)
            expect(result.stdout).toContain(
                'Usage: critter [options] [command]',
            )
            expect(result.stdout).toContain('With no command, show')
            expect(result.stdout).toContain('replacing your current pet')
            for (const command of [
                'new',
                'feed',
                'clean',
                'medicine',
                'play',
                'sleep',
                'stop',
            ]) {
                expect(result.stdout).toMatch(
                    new RegExp(`^[ \\t]+${command}[ \\t]{2,}\\S`, 'm'),
                )
            }
            expect(result.stderr).toBe('')
            expect(existsSync(statePath())).toBe(false)
        },
    )

    it('exits with status 7 for an unknown command', () => {
        const result = run('unknown')
        expect(result.status).toBe(7)
        expect(result.stderr).toContain('Unknown command: unknown')
        expect(existsSync(statePath())).toBe(false)
    })

    it('exits with status 1 when no critter exists', () => {
        const result = run()
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('No Critter')
        expect(existsSync(statePath())).toBe(false)
    })

    it('creates a pet and displays an existing pet without a command', () => {
        expect(run('new').status).toBe(0)
        expect(existsSync(statePath())).toBe(true)
        const result = run()
        expect(result.status).toBe(0)
        expect(result.stderr).toBe('')
        expect(result.stdout).toContain('Age:')
    })

    it.each([
        ['clean', 'idle'],
        ['feed', 'eating'],
        ['medicine', 'healing'],
        ['play', 'playing'],
        ['sleep', ['sleeping', 'refusing']],
        ['stop', 'idle'],
    ] as const)('runs and persists the %s command', (command, action) => {
        expect(run('new').status).toBe(0)
        advancePetToStageOne()
        const result = run(command)
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('Age:')
        expect(result.stderr).toBe('')
        const savedAction = JSON.parse(readFileSync(statePath(), 'utf8')).action
        if (Array.isArray(action)) {
            expect(action).toContain(savedAction)
        } else {
            expect(savedAction).toBe(action)
        }
        if (savedAction !== 'idle') {
            expect(result.stdout).toContain(savedAction.toUpperCase())
        }
    })

    it.each(['-n', '--no-nerd-fonts'])(
        'accepts %s before or after the command',
        (flag) => {
            const before = run(flag, 'new')
            const after = run('new', flag)
            expect(before.status).toBe(0)
            expect(after.status).toBe(0)
            expect(before.stdout).not.toMatch(/\p{Co}/u)
            expect(after.stdout).not.toMatch(/\p{Co}/u)
        },
    )

    it.each(['-d', '--debug'])(
        'accepts %s while the critter is an egg',
        (flag) => {
            const result = run(flag, 'new')
            expect(result.status).toBe(0)
            expect(result.stdout).toContain('Age:    0 seconds')
            for (const stat of [
                'Happy:',
                'Hunger:',
                'Energy:',
                'Health:',
                'Toilet:',
            ]) {
                expect(result.stdout).not.toContain(stat)
            }
        },
    )
})

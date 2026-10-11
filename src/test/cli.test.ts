import { buildSync } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
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
        ['clean', 'cleaning'],
        ['feed', 'eating'],
        ['medicine', 'healing'],
        ['play', 'playing'],
        ['sleep', ['sleeping', 'refusing']],
        ['stop', 'idle'],
    ] as const)('runs and persists the %s command', (command, action) => {
        expect(run('new').status).toBe(0)
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

    it.each(['-d', '--debug'])('prints exact stat values with %s', (flag) => {
        const result = run(flag, 'new')
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('Happy:  󰋑󰋑󰋑󰋑󰋑 (1000000)')
    })
})

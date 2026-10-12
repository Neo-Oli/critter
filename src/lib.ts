import { type Command, Critter as Engine } from './critter.ts'
import { type CritterData } from './data.ts'

export type { CritterData } from './data.ts'

export interface CritterOptions {
    browser?: boolean
    debug?: boolean
}

export class Critter {
    readonly debug: boolean
    private engine: Engine

    // Loads the saved critter; throws if there is none.
    constructor({ browser = true, debug = false }: CritterOptions = {}) {
        this.debug = debug
        this.engine = new Engine({ browser })
        if (this.engine.error) throw new Error(this.engine.error)
    }

    static create = (options?: CritterOptions) => {
        new Engine({ browser: options?.browser ?? true, command: 'new' })
        return new Critter(options)
    }

    static isAlive = ({
        browser = true,
    }: Pick<CritterOptions, 'browser'> = {}) => {
        const engine = new Engine({ browser })
        return !engine.error && engine.alive
    }

    clean = (): CritterData => this.run('clean')
    dismiss = (): CritterData => this.run('dismiss')
    feed = (): CritterData => this.run('feed')
    heal = (): CritterData => this.run('heal')
    play = (): CritterData => this.run('play')
    sleep = (): CritterData => this.run('sleep')
    status = (): CritterData => this.run(undefined)
    stop = (): CritterData => this.run('stop')

    private run(command: Command | undefined): CritterData {
        this.engine.act(command)
        return this.engine.data({ debug: this.debug })
    }
}

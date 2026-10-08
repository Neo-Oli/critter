import { loadState, saveState } from './io.ts'
import { max, normal, satiety } from './config.ts'
import { now } from './utils.ts'

type Action = 'idle' | 'sleeping' | 'feeding'
type Command = 'sleep' | 'feed' | 'new' | 'clean'
interface CritterOptions {
    name?: string
    command?: Command
}
export class Critter {
    birth = now
    time = this.birth
    actionTime = 0
    age = 0
    satiety = normal
    happiness = normal
    energy = normal
    health = max
    action: Action = 'idle'
    name: string | undefined = undefined
    error: string | undefined = undefined

    constructor({ name, command }: CritterOptions) {
        let state

        try {
            state = loadState()
        } catch {
            state = {}
        }
        if (command === 'new') {
            this.name = name
        } else {
            this.name = state?.name ?? this.name
            this.birth = state?.birth ?? this.birth
            this.age = state?.age ?? this.age
            this.satiety = state?.satiety ?? this.satiety
            this.happiness = state?.happiness ?? this.happiness
            this.energy = state?.energy ?? this.energy
            this.health = state?.health ?? this.health
            this.actionTime = state?.actionTime ?? this.actionTime
            this.time = state?.time ?? this.time
            if (!this.name) {
                this.error = 'No Critter'
                return
            }
        }
        this.process()
        command === 'feed' && this.feed()
        saveState(this.state())
    }
    process = () => {
        const elapsed = now - this.time
        for (let i = 0; i < elapsed; i += 1) {
            this.age += 1
            if (this.actionTime === 0) this.action = 'idle'
            this.action === 'feeding'
                ? (this.satiety += satiety.action)
                : (this.satiety += satiety.tick)
            this.actionTime += 1
        }
    }
    feed = () => {
        this.action = 'feeding'
        this.actionTime = satiety.time
    }

    state = () => {
        const {
            name,
            error,
            birth,
            age,
            satiety,
            happiness,
            energy,
            health,
            action,
            actionTime,
        } = this
        return {
            birth,
            age,
            satiety,
            happiness,
            energy,
            actionTime,
            health,
            error,
            name,
            time: now,
            action,
        }
    }
}

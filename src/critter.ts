import { loadState, saveState } from './io.ts'
import { max, normal } from './config.ts'
import { now } from './utils.ts'

type Action = 'idle' | 'sleeping'
type Command = 'sleep' | 'feed' | 'new' | 'clean'
interface CritterOptions {
    name?: string
    command?:Command
}
export class Critter {
    birth = now()
    time= this.birth
    age = 0
    satiety = 0
    happiness = normal
    energy = normal
    health = max
    action: Action = "idle"
    name: string | undefined = undefined
    error: string | undefined = undefined

    constructor({ name, command }: CritterOptions) {
        let state

        try {
            state = loadState()
        } catch {
            state = {}
        }
        if (name) {
            this.name = name
        } else {
            this.name = state?.name ?? this.name
            this.birth = state?.birth ?? this.birth
            this.age = state?.age ?? this.age
            this.satiety = state?.satiety ?? this.satiety
            this.happiness = state?.happiness ?? this.happiness
            this.energy = state?.energy ?? this.energy
            this.health = state?.health ?? this.health
            this.time = state?.time ?? this.time
            if (!this.name) {
                this.error = 'No Critter'
                return
            }
        }
        this.process()
        saveState(this.state())
    }
    process = () =>{
        const elapsed = now() - this.time
        this.age+=elapsed
    }

    state = () => {
        const { name, error, birth, age, satiety, happiness, energy, health } =
            this
        return {
            birth,
            age,
            satiety,
            happiness,
            energy,
            health,
            error,
            name,
            time: now(),
        }
    }
}

import { loadState , saveState} from './io.ts'
import { max, normal } from './config.ts'

interface CritterOptions {
    name?: string
}
export class Critter {
    birth = Date.now()
    age = 0
    hunger = 0
    happiness = normal
    energy = normal
    health = max
    name: string | undefined = undefined
    error: string | undefined = undefined

    constructor({ name }: CritterOptions) {
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
            this.hunger = state?.hunger ?? this.hunger
            this.happiness = state?.happiness ?? this.happiness
            this.energy = state?.energy ?? this.energy
            this.health = state?.health ?? this.health
            if (!this.name) {
                this.error = 'No Critter'
                return
            }
        }
        saveState(this.state)
    }

    state = () => {
        const { name,error, birth, age, hunger, happiness, energy, health } = this
        return {
            birth,
            age,
            hunger,
            happiness,
            energy,
            health,
            error,
            name,
            time: Date.now(),
        }
    }
}

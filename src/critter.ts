import { high, low, max, normal, speed, too_high } from './config.ts'
import { loadState, saveState } from './io.ts'
import { plain } from './plain.ts'
import { hour, minute, now } from './utils.ts'

export type Action =
    'cleaning' | 'eating' | 'healing' | 'idle' | 'playing' | 'sleeping'

export type Mood =
    CleanlinessMood | EnergyMood | FoodMood | HappinessMood | HealthMood

export interface PersistedCritterState {
    action: Action
    actionTime: number
    age: number
    birth: number
    cleanliness: number
    energy: number
    happiness: number
    health: number
    satiety: number
    time: number
}
type CleanlinessMood = 'cleaning' | 'dirty'
type Command = 'clean' | 'feed' | 'medicine' | 'new' | 'play' | 'sleep' | 'stop'
interface CritterOptions {
    command?: Command
}
type EnergyMood = 'sleeping' | 'tired'
type FoodMood = 'eating' | 'hungry' | 'stuffed'
type HappinessMood = 'happy' | 'sad'
type HealthMood = 'dead' | 'healing' | 'sick'
interface Plain {
    noNerdFonts: boolean
}

const set = (value: number, smin = 0, smax = max) => {
    return Math.min(smax, Math.max(smin, value))
}
export class Critter {
    action: Action = 'idle'
    actionTime = 0
    age = 0
    alive = true
    birth = 0
    cleanliness = low
    energy = normal
    error: string | undefined = undefined
    happiness = max
    health = high
    mood: Mood[] = []
    satiety = normal
    time = this.birth

    constructor({ command }: CritterOptions) {
        let state

        try {
            state = loadState()
        } catch {
            state = {}
        }
        if (command === 'new') {
            this.birth = now()
            this.time = this.birth
        } else {
            this.birth = state?.birth ?? this.birth
            this.age = state?.age ?? this.age
            this.satiety = state?.satiety ?? this.satiety
            this.happiness = state?.happiness ?? this.happiness
            this.energy = state?.energy ?? this.energy
            this.cleanliness = state?.cleanliness ?? this.cleanliness
            this.health = state?.health ?? this.health
            this.actionTime = state?.actionTime ?? this.actionTime
            this.action = state?.action ?? this.action
            this.time = state?.time ?? this.time
            if (!this.birth) {
                this.error = 'No Critter'
                return
            }
        }
        this.process()
        if (command === 'feed') {
            this.feed()
        }
        if (command === 'clean') {
            this.clean()
        }
        if (command === 'medicine') {
            this.medicine()
        }
        if (command === 'play') {
            this.play()
        }
        if (command === 'sleep') {
            this.sleep()
        }
        if (command === 'stop') {
            this.stop()
        }
        saveState(this.persistedState())
    }
    clean = () => {
        this.action = 'cleaning'
        this.actionTime = 60
    }
    die = () => {
        this.alive = false
        this.mood = ['dead']
    }
    feed = () => {
        this.action = 'eating'
        this.actionTime = minute
    }
    getCritterState = (): Action | Mood => {
        const moodPriority: Mood[] = [
            'dead',
            'sick',
            'tired',
            'stuffed',
            'hungry',
            'dirty',
            'sad',
            'stuffed',
            'happy',
        ]
        if (this.action !== 'idle') return this.action

        const mood = moodPriority.find((priority) =>
            this.mood.includes(priority),
        )
        return mood ?? 'idle'
    }
    medicine = () => {
        this.action = 'healing'
        this.actionTime = 10
    }
    persistedState = (): PersistedCritterState => {
        const {
            action,
            actionTime,
            age,
            birth,
            cleanliness,
            energy,
            happiness,
            health,
            satiety,
        } = this
        return {
            action,
            actionTime,
            age,
            birth,
            cleanliness,
            energy,
            happiness,
            health,
            satiety,
            time: now(),
        }
    }
    plain = ({ noNerdFonts }: Plain) =>
        plain({
            actionTime: this.actionTime,
            age: this.age,
            cleanliness: this.cleanliness,
            energy: this.energy,
            happiness: this.happiness,
            health: this.health,
            noNerdFonts,
            satiety: this.satiety,
            state: this.getCritterState(),
        })
    play = () => {
        this.action = 'playing'
        this.actionTime = 2 * minute
    }

    process = () => {
        const elapsed = (now() - this.time) * speed
        for (let i = 0; i < elapsed; i += 1) {
            this.age += 1
            this.mood = []
            if (this.health === 0) {
                this.die()
                return
            }
            if (this.actionTime <= 0) this.action = 'idle'
            if (this.action === 'eating') {
                this.satiety = set(this.satiety + 10000)
                this.cleanliness = set(this.cleanliness - 1000)
            } else {
                this.satiety = set(this.satiety - 10)
            }
            if (this.action === 'sleeping') {
                this.energy = set(this.energy + 10000)
                this.cleanliness = set(this.cleanliness - 10)
            } else {
                this.energy = set(this.energy - 10)
            }
            if (this.action === 'cleaning') {
                this.cleanliness = set(this.cleanliness + 10000)
                this.energy = set(this.energy - 10)
            } else {
                this.cleanliness = set(this.cleanliness - 10)
            }

            if (this.action === 'healing') {
                this.health = set(this.health + 10000)
                this.energy = set(this.energy - 1000)
            } else {
                this.health = set(this.health + 10)
            }
            if (this.action === 'playing') {
                this.happiness = set(this.happiness + 10000)
                this.cleanliness = set(this.cleanliness - 1000)
                this.energy = set(this.energy - 1000)
            } else {
                this.happiness = set(this.happiness - 10)
            }
            this.actionTime = set(this.actionTime - 1, 0, Infinity)
            if (this.satiety > too_high) {
                this.health = set(this.health - 100)
                this.mood.push('stuffed')
            } else if (this.satiety === 0) {
                this.health = set(this.health - 1000)
            } else if (this.satiety < low) {
                this.mood.push('hungry')
            }

            if (this.health < low) {
                this.mood.push('sick')
            }

            if (this.energy === 0 && this.action !== 'sleeping') {
                this.health = set(this.health - 1000)
                this.happiness = set(this.happiness - 100000)
                this.sleep()
            }
            if (this.energy < low) {
                this.mood.push('tired')
            }

            if (this.happiness > high) {
                this.mood.push('happy')
            } else if (this.happiness < low) {
                this.mood.push('sad')
            }
            if (this.happiness === 0) {
                this.health = set(this.health - 1000)
            }

            if (this.cleanliness < low) {
                this.mood.push('dirty')
            }
        }
    }
    sleep = () => {
        this.action = 'sleeping'
        this.actionTime = 2 * hour
    }
    stop = () => {
        if (this.action === 'eating' || this.action === 'sleeping') {
            this.happiness = set(this.happiness - 1000)
        }
        this.action = 'idle'
        this.actionTime = 0
    }
}

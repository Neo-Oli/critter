import { loadState, saveState } from './io.ts'
import { max, normal, high, low, too_high } from './config.ts'
import { now, minute, hour } from './utils.ts'

type Action =
    'idle' | 'sleeping' | 'feeding' | 'healing' | 'playing' | 'cleaning'
type Command = 'sleep' | 'feed' | 'new' | 'clean' | 'medicine' | 'play' | 'stop'
type FoodMood = 'stuffed' | 'full' | 'hungry' | 'famished'
type HealthMood = 'sick' | 'ill' | 'dead'
type EnergyMood = 'energized' | 'rested' | 'tired' | 'exhausted'
type HappinessMood = 'happy' | 'bored' | 'sad'
type CleanlinessMood = 'clean' | 'dirty' | 'filthy'
type Mood = FoodMood | HealthMood | EnergyMood | HappinessMood | CleanlinessMood
interface CritterOptions {
    command?: Command
}

const set = (value: number, smin = 0, smax = max) => {
    return Math.min(smax, Math.max(smin, value))
}
export class Critter {
    birth = 0
    time = this.birth
    actionTime = 0
    alive = true
    age = 0
    satiety = normal
    happiness = max
    energy = normal
    cleanliness = low
    health = high
    action: Action = 'idle'
    mood: Mood[] = []
    error: string | undefined = undefined

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
        saveState(this.state())
    }
    process = () => {
        const elapsed = (now() - this.time) * 100
        for (let i = 0; i < elapsed; i += 1) {
            this.age += 1
            this.mood = []
            if (this.health === 0) {
                this.alive = false
                this.mood = ['dead']
                return
            }
            if (this.actionTime <= 0) this.action = 'idle'
            if (this.action === 'feeding') {
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
            } else if (this.satiety > high) {
                this.mood.push('full')
            } else if (this.satiety === 0) {
                this.mood.push('famished')
                this.health = set(this.health - 1000)
            } else if (this.satiety < low) {
                this.mood.push('hungry')
            }

            if (this.health < low) {
                this.mood.push('ill')
            } else if (this.health < normal) {
                this.mood.push('ill')
            }

            if (this.energy === 0) {
                this.mood.push('exhausted')
            } else if (this.energy < low) {
                this.mood.push('tired')
            } else if (this.energy > high) {
                this.mood.push('energized')
            } else {
                this.mood.push('rested')
            }

            if (this.happiness > high) {
                this.mood.push('happy')
            } else if (this.happiness < low) {
                this.mood.push('sad')
            } else {
                this.mood.push('bored')
            }

            if (this.cleanliness > high) {
                this.mood.push('clean')
            } else if (this.cleanliness < low) {
                this.mood.push('filthy')
            } else {
                this.mood.push('dirty')
            }
        }
    }
    feed = () => {
        this.action = 'feeding'
        this.actionTime = minute
    }
    sleep = () => {
        this.action = 'sleeping'
        this.actionTime = 2 * hour
    }
    play = () => {
        this.action = 'playing'
        this.actionTime = 2 * minute
    }
    medicine = () => {
        this.action = 'healing'
        this.actionTime = 10
    }
    clean = () => {
        this.action = 'cleaning'
        this.actionTime = 60
    }
    stop = () => {
        if (this.action === 'feeding' || this.action === 'sleeping') {
            this.happiness = set(this.happiness - 1000)
        }
        this.action = 'idle'
        this.actionTime = 0
    }

    state = () => {
        const {
            error,
            birth,
            age,
            satiety,
            happiness,
            energy,
            cleanliness,
            health,
            alive,
            action,
            actionTime,
            mood,
        } = this
        return {
            alive,
            birth,
            age,
            satiety,
            happiness,
            energy,
            cleanliness,
            actionTime,
            health,
            error,
            mood,
            time: now(),
            action,
        }
    }
}

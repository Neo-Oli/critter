import { happinessPenalty, high, low, max, normal, speed } from './config.ts'
import { loadState, saveState } from './io.ts'
import { plain } from './plain.ts'
import { hour, minute, now } from './utils.ts'

export type Action =
    'eating' | 'healing' | 'idle' | 'playing' | 'refusing' | 'sleeping'

export type Mood = EnergyMood | FoodMood | HappinessMood | HealthMood

export interface PersistedCritterState {
    action: Action
    actionTime: number
    age: number
    birth: number
    energy: number
    happiness: number
    health: number
    poo: boolean
    satiety: number
    time: number
    toilet: number
}
type Command = 'clean' | 'feed' | 'medicine' | 'new' | 'play' | 'sleep' | 'stop'
interface CritterOptions {
    command?: Command
}
type EnergyMood = 'sleeping' | 'tired'
type FoodMood = 'eating' | 'hungry'
type HappinessMood = 'happy' | 'sad'
type HealthMood = 'dead' | 'healing' | 'sick'
interface Plain {
    debug?: boolean
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
    energy = normal
    error: string | undefined = undefined
    happiness = max
    health = high
    mood: Mood[] = []
    poo = false
    satiety = normal
    time = this.birth
    toilet = low

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
            this.toilet = state?.toilet ?? this.toilet
            this.health = state?.health ?? this.health
            this.poo = state?.poo ?? this.poo
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
        this.poo = false
    }
    die = () => {
        this.action = 'idle'
        this.actionTime = 0
        this.alive = false
        this.mood = ['dead']
    }
    feed = () => {
        if (this.satiety > high) {
            this.refuse()
            return
        }
        this.action = 'eating'
        this.actionTime =
            this.satiety < low
                ? Math.floor((high - this.satiety) / 6250)
                : minute
    }
    getCritterState = (): Action | Mood => {
        if (!this.alive) return 'dead'
        const moodPriority: Mood[] = [
            'dead',
            'sick',
            'tired',
            'hungry',
            'sad',
            'happy',
        ]

        const mood = moodPriority.find((priority) =>
            this.mood.includes(priority),
        )
        const main=this.action !== 'idle' ? this.action : mood ?? 'idle'
        return { 
            main: main,

            sprite: main!=='eating' ? main :mood??'idle',
            bottom: main === 'eating' ? 'food' :
            this.poo? 'poo':'none',
            top:'none'
            ,reverse: main==="eating"
        }
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
            energy,
            happiness,
            health,
            poo,
            satiety,
            toilet,
        } = this
        return {
            action,
            actionTime,
            age,
            birth,
            energy,
            happiness,
            health,
            poo,
            satiety,
            time: now(),
            toilet,
        }
    }
    plain = ({ debug, noNerdFonts }: Plain) =>
        plain({
            actionTime: this.actionTime,
            age: this.age,
            debug,
            energy: this.energy,
            happiness: this.happiness,
            health: this.health,
            noNerdFonts,
            poo: this.poo,
            satiety: this.satiety,
            state: this.getCritterState(),
            toilet: this.toilet,
        })
    play = () => {
        this.action = 'playing'
        this.actionTime = 2 * minute
    }
    process = () => {
        const currentTime = now()
        const elapsed = Math.max(
            0,
            Math.floor((currentTime - this.time) * speed),
        )
        this.time = currentTime
        if (this.health === 0) {
            this.die()
            return
        }
        for (let tick = 0; tick < elapsed; tick += 1) {
            this.age += 1
            if (this.actionTime <= 0) this.action = 'idle'
            if (this.action === 'eating') {
                this.satiety = set(this.satiety + 6250)
                if (this.satiety >= max) this.refuse()
            } else {
                this.satiety = set(this.satiety - 23)
            }
            if (this.action === 'sleeping') {
                this.energy = set(this.energy + 139)
                if (this.energy === max) {
                    this.action = 'idle'
                    this.actionTime = 0
                }
            } else {
                this.energy = set(this.energy - 21)
            }

            if (this.action === 'healing') {
                this.health = set(this.health + 100000)
            } else if (this.satiety > 0 && !this.poo) {
                this.health = set(this.health + 30)
            }
            if (this.action === 'playing') {
                this.happiness = set(
                    this.happiness + (this.energy < low ? 4167 : 8333),
                )
            } else {
                this.happiness = set(this.happiness - 26)
            }
            this.actionTime = set(this.actionTime - 1, 0, Infinity)
            if (this.actionTime === 0) this.action = 'idle'
            if (this.satiety === 0) {
                this.health = set(this.health - (this.health > low ? 14 : 3))
            } else if (this.poo) {
                this.health = set(this.health - 2)
            }
            if (this.health === 0) {
                this.die()
                return
            }
            if (this.energy === 0 && this.action !== 'sleeping') {
                this.sleep()
            }
            if (this.toilet === 0) {
                this.poo = true
                this.toilet = set(max)
            }
        }
        this.updateMood()
    }
    refuse = () => {
        this.action = 'refusing'
        this.actionTime = 30
        this.happiness = set(this.happiness - happinessPenalty)
    }

    sleep = () => {
        if (this.energy >= normal) {
            this.refuse()
            return
        }
        this.action = 'sleeping'
        this.actionTime = 2 * hour
    }
    stop = () => {
        if (this.action === 'eating' || this.action === 'sleeping') {
            this.happiness = set(this.happiness - happinessPenalty)
        }
        this.action = 'idle'
        this.actionTime = 0
    }
    updateMood = () => {
        this.mood = []
        if (this.satiety < low) {
            this.mood.push('hungry')
        }
        if (this.health < low) {
            this.mood.push('sick')
        }
        if (this.energy < low) {
            this.mood.push('tired')
        }
        if (this.happiness > high) {
            this.mood.push('happy')
        } else if (this.happiness < low) {
            this.mood.push('sad')
        }
    }
}

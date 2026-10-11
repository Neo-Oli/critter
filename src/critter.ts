import { high, low, max, normal, penalty, schedules, speed } from './config.ts'
import { loadState, saveState } from './io.ts'
import { type Plain, plain } from './plain.ts'
import { minute, now } from './utils.ts'

export type Action =
    'eating' | 'healing' | 'idle' | 'playing' | 'refusing' | 'sleeping'

export interface CritterRenderState {
    bottom: SpriteAsset
    main: Action | Mood
    reverse: boolean
    sprite: Exclude<Action | Mood, 'eating' | 'healing' | 'playing'>
    top: SpriteAsset
}

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

export type SpriteAsset = 'food' | 'ill' | 'medicine' | 'none' | 'poo' | 'toy'
type Command = 'clean' | 'feed' | 'medicine' | 'new' | 'play' | 'sleep' | 'stop'
interface CritterOptions {
    command?: Command
}
type EnergyMood = 'sleeping' | 'tired'
type FoodMood = 'hungry'
type HappinessMood = 'happy' | 'sad'
type HealthMood = 'dead' | 'sick'
const set = (value: number, smin = 0, smax = max) => {
    return Math.round(Math.min(smax, Math.max(smin, value)))
}
const changeBySchedule = (
    value: number,
    secondsPerCycle: number,
    direction: -1 | 1,
) => set(value + Math.ceil(max / secondsPerCycle) * direction)
const applyPenalty = (value: number) => set(value * (1 - penalty))
export class Critter {
    action: Action = 'idle'
    actionTime = 0
    age = 0
    alive = true
    birth = 0
    energy = normal
    error: string | undefined = undefined
    happiness = normal
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
            this.satiety = set(state?.satiety ?? this.satiety)
            this.happiness = set(state?.happiness ?? this.happiness)
            this.energy = set(state?.energy ?? this.energy)
            this.toilet = set(state?.toilet ?? this.toilet)
            this.health = set(state?.health ?? this.health)
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
                ? Math.floor(
                      ((high - this.satiety) / max) * schedules.satiety.eating,
                  )
                : minute
    }
    getCritterState = (): CritterRenderState => {
        if (!this.alive)
            return {
                bottom: 'none',
                main: 'dead',
                reverse: false,
                sprite: 'dead',
                top: 'none',
            }
        const moodPriority: Mood[] = [
            'dead',
            'sick',
            'tired',
            'hungry',
            'sad',
            'happy',
        ]

        const mood =
            moodPriority.find((priority) => this.mood.includes(priority)) ??
            'idle'
        const main = this.action !== 'idle' ? this.action : mood
        return {
            bottom:
                main === 'playing'
                    ? 'toy'
                    : main === 'eating'
                      ? 'food'
                      : this.poo
                        ? 'poo'
                        : 'none',
            main: main,
            reverse: ['eating', 'playing'].includes(main),
            sprite: ['eating', 'healing', 'playing'].includes(main as Action)
                ? mood
                : (main as CritterRenderState['sprite']),
            top:
                this.action === 'healing'
                    ? 'medicine'
                    : this.health < low
                      ? 'ill'
                      : 'none',
        }
    }
    medicine = () => {
        this.action = 'healing'
        this.actionTime = schedules.health.healingAction
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
    plain = ({ debug, noNerdFonts }: Pick<Plain, 'debug' | 'noNerdFonts'>) =>
        plain({
            actionTime: this.actionTime,
            age: this.age,
            debug,
            energy: this.energy,
            happiness: this.happiness,
            health: this.health,
            noNerdFonts,
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
            const healing = this.action === 'healing'
            if (this.action === 'eating') {
                this.satiety = changeBySchedule(
                    this.satiety,
                    schedules.satiety.eating,
                    1,
                )
                if (this.satiety >= max) this.refuse()
            } else {
                this.satiety = changeBySchedule(
                    this.satiety,
                    this.action === 'playing'
                        ? schedules.satiety.playing
                        : schedules.satiety.idle,
                    -1,
                )
            }
            if (this.action === 'sleeping') {
                this.energy = changeBySchedule(
                    this.energy,
                    this.health < low
                        ? schedules.energy.sleepingSick
                        : schedules.energy.sleeping,
                    1,
                )
                if (this.energy >= max) {
                    this.energy = max
                    this.action = 'idle'
                    this.actionTime = 0
                }
            } else {
                this.energy = changeBySchedule(
                    this.energy,
                    this.action === 'playing'
                        ? schedules.energy.playing
                        : schedules.energy.awake,
                    -1,
                )
            }

            if (healing) {
                this.health = changeBySchedule(
                    this.health,
                    schedules.health.healing,
                    1,
                )
            }
            if (this.action === 'playing') {
                this.happiness = changeBySchedule(
                    this.happiness,
                    this.energy < low
                        ? schedules.happiness.playingTired
                        : schedules.happiness.playing,
                    1,
                )
            } else {
                this.happiness = changeBySchedule(
                    this.happiness,
                    schedules.happiness.idle,
                    -1,
                )
            }
            this.actionTime = set(this.actionTime - 1, 0, Infinity)
            if (this.actionTime === 0) this.action = 'idle'
            if (!healing) {
                if (this.poo) {
                    this.health = changeBySchedule(
                        this.health,
                        schedules.health.poo,
                        -1,
                    )
                }
                if (this.happiness === 0) {
                    this.health = changeBySchedule(
                        this.health,
                        schedules.health.happinessZero,
                        -1,
                    )
                } else if (this.happiness < low) {
                    this.health = changeBySchedule(
                        this.health,
                        schedules.health.happinessLow,
                        -1,
                    )
                }
                if (this.satiety === 0) {
                    this.health = changeBySchedule(
                        this.health,
                        schedules.health.starving,
                        -1,
                    )
                } else if (this.satiety < low) {
                    this.health = changeBySchedule(
                        this.health,
                        schedules.health.hungry,
                        -1,
                    )
                } else if (!this.poo && this.happiness >= low) {
                    if (this.health < low) {
                        this.health = Math.min(
                            low,
                            changeBySchedule(
                                this.health,
                                schedules.health.recovery,
                                1,
                            ),
                        )
                    } else if (this.health > low) {
                        this.health = changeBySchedule(
                            this.health,
                            schedules.health.recovery,
                            1,
                        )
                    }
                }
            }
            const toiletSchedule =
                this.satiety > high
                    ? schedules.toilet.high
                    : this.satiety > normal
                      ? schedules.toilet.normal
                      : this.satiety > low
                        ? schedules.toilet.low
                        : undefined
            if (toiletSchedule !== undefined) {
                this.toilet = changeBySchedule(this.toilet, toiletSchedule, -1)
                if (this.toilet <= 0) {
                    this.poo = true
                    this.toilet = max
                }
            }
            if (this.health === 0) {
                this.die()
                return
            }
            if (this.energy === 0 && this.action !== 'sleeping') {
                this.sleep()
                this.health = applyPenalty(this.health)
                this.happiness = applyPenalty(this.happiness)
            }
        }
        this.updateMood()
    }
    refuse = () => {
        this.action = 'refusing'
        this.actionTime = 30
        this.happiness = applyPenalty(this.happiness)
    }

    sleep = () => {
        if (this.energy >= normal) {
            this.refuse()
            return
        }
        this.action = 'sleeping'
        this.actionTime = schedules.energy.sleeping
    }
    stop = () => {
        if (['eating', 'sleeping'].includes(this.action)) {
            this.happiness = applyPenalty(this.happiness)
        }
        this.action = 'idle'
        this.actionTime = 0
    }
    updateMood = () => {
        this.mood = []
        if (this.satiety < low) {
            this.mood.push('hungry')
        }
        if (this.health < normal) {
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

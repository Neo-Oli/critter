import {
    high,
    low,
    max,
    normal,
    penalty,
    schedules,
    speed,
    type Stage,
    stagingSchedule,
} from './config.ts'
import { type Data, data as renderData } from './data.ts'
import { loadState, saveState } from './io.ts'
import { json as renderJson } from './json.ts'
import { type Plain, plain } from './plain.ts'
import { type Short, short } from './short.ts'
import { minute, now } from './utils.ts'

export type Action =
    'eating' | 'healing' | 'idle' | 'playing' | 'refusing' | 'sleeping'

export type Command =
    'clean' | 'dismiss' | 'feed' | 'heal' | 'new' | 'play' | 'sleep' | 'stop'

export interface CritterRenderState {
    bottom: SpriteAsset
    main: Action | Mood
    reverse: boolean
    sprite: Exclude<Action | Mood, 'eating' | 'healing' | 'playing'>
    stage: Stage
    top: SpriteAsset
}

export type Mood = EnergyMood | FoodMood | HappinessMood | HealthMood

export interface PersistedCritterState {
    action: Action
    actionTime: number
    age: number
    alert: boolean
    birth: number
    energy: number
    happiness: number
    health: number
    poo: boolean
    satiety: number
    time: number
    toilet: number
}
export type SpriteAsset = 'food' | 'heal' | 'ill' | 'none' | 'poo' | 'toy'
interface CritterOptions {
    browser?: boolean
    command?: Command
    stage?: Stage
}
type EnergyMood = 'sleeping' | 'tired'
type FoodMood = 'hungry'
type HappinessMood = 'happy' | 'sad'
type HealthMood = 'dead' | 'sick'
const alertFlags = {
    dead: 1 << 6,
    hungry: 1 << 0,
    ill: 1 << 2,
    poo: 1 << 4,
    sad: 1 << 5,
    sick: 1 << 1,
    tired: 1 << 3,
}
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
    alert = false
    alive = true
    birth = 0
    energy = normal
    error: string | undefined = undefined
    happiness = normal
    health = high
    mood: Mood[] = []
    poo = false
    satiety = low
    time = this.birth
    toilet = low
    get stage(): Stage {
        if (this.age < stagingSchedule.stage0) return 0
        if (this.age < stagingSchedule.stage0 + stagingSchedule.stage1) return 1
        return 2
    }

    private activeAlerts = 0
    private browser: boolean
    constructor({ browser = false, command, stage = 0 }: CritterOptions) {
        this.browser = browser
        let state

        try {
            state = loadState(browser)
        } catch {
            state = {}
        }
        if (command === 'new') {
            this.age =
                stage === 0
                    ? 0
                    : stagingSchedule.stage0 +
                      (stage === 2 ? stagingSchedule.stage1 : 0)
            this.time = now()
            this.birth = this.time - this.age
        } else {
            this.birth = state?.birth ?? this.birth
            this.age = state?.age ?? this.age
            this.satiety = set(state?.satiety ?? this.satiety)
            this.happiness = set(state?.happiness ?? this.happiness)
            this.energy = set(state?.energy ?? this.energy)
            this.toilet = set(state?.toilet ?? this.toilet)
            this.health = set(state?.health ?? this.health)
            this.poo = state?.poo ?? this.poo
            this.alert = state?.alert ?? this.alert
            this.actionTime = state?.actionTime ?? this.actionTime
            this.action = state?.action ?? this.action
            this.time = state?.time ?? this.time
            if (!this.birth) {
                this.error = 'No Critter'
                return
            }
        }
        this.activeAlerts = this.getAlertConditions()
        this.act(command)
    }
    act = (command?: Command) => {
        if (this.stage === 0) {
            this.action = 'idle'
            this.actionTime = 0
        }
        this.process()
        if (command === 'feed') {
            this.feed()
        }
        if (command === 'clean') {
            this.clean()
        }
        if (command === 'heal') {
            this.heal()
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
        if (command === 'dismiss') {
            this.dismiss()
        }
        this.updateMood()
        saveState(this.persistedState(), this.browser)
    }
    clean = () => {
        if (this.stage === 0) return
        this.poo = false
    }
    data = ({ debug }: Pick<Plain, 'debug'>) =>
        renderData(this.dataOptions({ debug }))
    die = () => {
        this.action = 'idle'
        this.actionTime = 0
        this.alive = false
        this.mood = ['dead']
        this.updateAlert()
    }
    dismiss = () => {
        this.alert = false
    }
    feed = () => {
        if (this.stage === 0) return
        if (this.poo) this.health = applyPenalty(this.health)
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
        if (this.stage === 0)
            return {
                bottom: 'none',
                main: 'idle',
                reverse: false,
                sprite: 'idle',
                stage: 0,
                top: 'none',
            }
        if (!this.alive)
            return {
                bottom: 'none',
                main: 'dead',
                reverse: false,
                sprite: 'dead',
                stage: this.stage,
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
            stage: this.stage,
            top:
                this.action === 'healing'
                    ? 'heal'
                    : this.health < low
                      ? 'ill'
                      : 'none',
        }
    }
    heal = () => {
        if (this.stage === 0) return
        this.action = 'healing'
        this.actionTime = schedules.health.healingAction
    }
    json = ({ debug }: Pick<Plain, 'debug'>) =>
        renderJson(this.dataOptions({ debug }))
    persistedState = (): PersistedCritterState => {
        const {
            action,
            actionTime,
            age,
            alert,
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
            alert,
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
        if (this.stage === 0) return
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
            if (this.stage !== 0) {
                this.die()
                return
            }
        }
        for (let tick = 0; tick < elapsed; tick += 1) {
            this.age += 1
            if (this.stage === 0) continue
            if (this.health === 0) {
                this.die()
                return
            }
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
            this.updateAlert()
        }
        if (this.stage !== 0) this.updateMood()
    }
    refuse = () => {
        if (this.stage === 0) return
        this.action = 'refusing'
        this.actionTime = 30
        this.happiness = applyPenalty(this.happiness)
    }
    short = ({ noNerdFonts }: Pick<Short, 'noNerdFonts'>) =>
        short({
            actionTime: this.actionTime,
            energy: this.energy,
            happiness: this.happiness,
            health: this.health,
            noNerdFonts,
            satiety: this.satiety,
            state: this.getCritterState(),
            toilet: this.toilet,
        })

    sleep = () => {
        if (this.stage === 0) return
        if (this.energy >= normal) {
            this.refuse()
            return
        }
        this.action = 'sleeping'
        this.actionTime = schedules.energy.sleeping
    }
    stop = () => {
        if (this.stage === 0) return
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
        this.updateAlert()
    }
    private dataOptions = ({ debug }: Pick<Plain, 'debug'>): Data => ({
        action: this.action,
        actionTime: this.actionTime,
        age: this.age,
        alert: this.alert,
        debug,
        energy: this.energy,
        happiness: this.happiness,
        health: this.health,
        poo: this.poo,
        satiety: this.satiety,
        state: this.getCritterState(),
        toilet: this.toilet,
    })
    private getAlertConditions = () =>
        (this.satiety < low ? alertFlags.hungry : 0) |
        (this.health < normal ? alertFlags.sick : 0) |
        (this.health < low ? alertFlags.ill : 0) |
        (this.energy < low ? alertFlags.tired : 0) |
        (this.poo ? alertFlags.poo : 0) |
        (this.happiness < low ? alertFlags.sad : 0) |
        (!this.alive ? alertFlags.dead : 0)
    private updateAlert = () => {
        const currentAlerts = this.getAlertConditions()
        if ((currentAlerts & ~this.activeAlerts) !== 0) {
            this.alert = true
        }
        this.activeAlerts = currentAlerts
    }
}

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { high, low, max, normal, penalty, schedules } from '../config.ts'
import { Critter } from '../critter.ts'
import { day, hour, minute } from '../utils.ts'

const runtime = vi.hoisted(() => ({ speed: 1, time: 1000000 }))
const storage = vi.hoisted(() => ({ loadState: vi.fn(), saveState: vi.fn() }))

vi.mock('../config.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../config.ts')>()),
    get speed() {
        return runtime.speed
    },
}))
vi.mock('../io.ts', () => storage)
vi.mock('../utils.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils.ts')>()),
    now: () => runtime.time,
}))

const advance = (pet: Critter, seconds: number) => {
    runtime.time += seconds
    pet.process()
}

const reportDeath = (elapsedSeconds: number) => {
    const days = Math.floor(elapsedSeconds / day)
    const hours = Math.floor((elapsedSeconds % day) / hour)
    const minutes = Math.floor((elapsedSeconds % hour) / minute)
    const seconds = elapsedSeconds % minute
    console.info(
        `Critter died after ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds (${elapsedSeconds} seconds total).`,
    )
}

const healthy = () => {
    const pet = new Critter({ command: 'new' })
    pet.toilet = max
    pet.energy = max
    pet.happiness = max
    pet.health = max
    pet.satiety = high
    return pet
}

const maxed = () => {
    const pet = healthy()
    pet.satiety = max
    return pet
}

beforeEach(() => {
    runtime.speed = 1
    runtime.time = 1000000
    storage.loadState.mockReset()
    storage.saveState.mockReset()
})

describe('stat schedule simulations', () => {
    it('keeps all stat values integral after a fractional schedule tick', () => {
        const pet = maxed()
        advance(pet, 1)

        for (const stat of [
            pet.energy,
            pet.happiness,
            pet.health,
            pet.satiety,
            pet.toilet,
        ]) {
            expect(Number.isInteger(stat)).toBe(true)
        }
    })

    it('respects strict stat mood thresholds at their boundaries', () => {
        const pet = healthy()
        pet.energy = normal
        pet.happiness = normal
        pet.health = normal
        pet.satiety = normal

        pet.health = normal - 1
        pet.process()
        expect(pet.mood).toContain('sick')
        pet.health = normal
        pet.process()
        expect(pet.mood).not.toContain('sick')

        pet.energy = low - 1
        pet.process()
        expect(pet.mood).toContain('tired')
        pet.energy = low
        pet.process()
        expect(pet.mood).not.toContain('tired')

        pet.satiety = low - 1
        pet.process()
        expect(pet.mood).toContain('hungry')
        pet.satiety = low
        pet.process()
        expect(pet.mood).not.toContain('hungry')

        pet.happiness = low - 1
        pet.process()
        expect(pet.mood).toContain('sad')
        pet.happiness = low
        pet.process()
        expect(pet.mood).not.toContain('sad')
        pet.happiness = high
        pet.process()
        expect(pet.mood).not.toContain('happy')
        pet.happiness = high + 1
        pet.process()
        expect(pet.mood).toContain('happy')
    })

    it('selects toilet drain rates strictly above low, normal, and high', () => {
        const toiletDrainAt = (postTickSatiety: number) => {
            const pet = healthy()
            pet.action = 'refusing'
            pet.actionTime = minute
            pet.satiety =
                postTickSatiety + Math.ceil(max / schedules.satiety.idle)
            advance(pet, 1)
            return max - pet.toilet
        }

        expect(toiletDrainAt(high + 1)).toBe(
            Math.ceil(max / schedules.toilet.high),
        )
        expect(toiletDrainAt(high)).toBe(
            Math.ceil(max / schedules.toilet.normal),
        )
        expect(toiletDrainAt(normal)).toBe(
            Math.ceil(max / schedules.toilet.low),
        )
        expect(toiletDrainAt(low + 1)).toBe(
            Math.ceil(max / schedules.toilet.low),
        )
        expect(toiletDrainAt(low)).toBe(0)
    })

    it('fills half a satiety bar during a one-minute feed action', () => {
        const pet = healthy()
        pet.satiety = normal
        pet.feed()
        advance(pet, minute)
        expect(pet.satiety).toBe(max)
    })

    it('ends a refusal action after thirty seconds', () => {
        const pet = healthy()
        pet.satiety = high + 1
        pet.feed()
        expect(pet.action).toBe('refusing')
        advance(pet, 30)
        expect(pet.action).toBe('idle')
        expect(pet.actionTime).toBe(0)
    })

    it('wakes automatically when sleeping energy reaches max', () => {
        const pet = healthy()
        pet.energy = max - 1
        pet.action = 'sleeping'
        pet.actionTime = 1
        advance(pet, 1)
        expect(pet.energy).toBe(max)
        expect(pet.action).toBe('idle')
        expect(pet.actionTime).toBe(0)
    })

    it('loses ten percent of health and happiness when exhaustion forces sleep', () => {
        const pet = maxed()
        pet.energy = 1
        pet.health = max
        pet.happiness = max

        advance(pet, 1)

        expect(pet.action).toBe('sleeping')
        expect(pet.health).toBe(Math.round(max * (1 - penalty)))
        expect(pet.happiness).toBe(
            Math.round(
                (max - Math.ceil(max / schedules.happiness.idle)) *
                    (1 - penalty),
            ),
        )
    })

    it('recovers energy more slowly from sleep while ill', () => {
        const healthySleeper = healthy()
        healthySleeper.action = 'sleeping'
        healthySleeper.actionTime = schedules.energy.sleeping
        healthySleeper.energy = normal

        const illSleeper = healthy()
        illSleeper.action = 'sleeping'
        illSleeper.actionTime = schedules.energy.sleeping
        illSleeper.energy = normal
        illSleeper.health = low - 1000

        runtime.time += 1
        healthySleeper.process()
        illSleeper.process()

        expect(healthySleeper.energy).toBe(
            normal + Math.ceil(max / schedules.energy.sleeping),
        )
        expect(illSleeper.energy).toBe(
            normal + Math.ceil(max / schedules.energy.sleepingSick),
        )
        expect(illSleeper.energy).toBeLessThan(healthySleeper.energy)
    })

    it('drains energy once per day and fully over ten play sessions', () => {
        const daily = healthy()
        daily.satiety = max
        advance(daily, 1)
        expect(daily.energy).toBe(Math.round(max - max / day))

        const playing = healthy()
        for (let session = 0; session < 10; session += 1) {
            playing.play()
            advance(playing, 2 * minute)
        }
        expect(playing.energy).toBe(0)
    })

    it('drains satiety three times daily and fully over five play sessions', () => {
        const daily = healthy()
        daily.satiety = max
        advance(daily, 1)
        expect(daily.satiety).toBe(Math.round(max - max / (day / 3)))

        const playing = healthy()
        for (let session = 0; session < 5; session += 1) {
            playing.play()
            advance(playing, 2 * minute)
        }
        expect(playing.satiety).toBe(0)
    })

    it('decays happiness to zero in six hours', () => {
        const pet = healthy()
        pet.happiness = max
        advance(pet, 1)
        expect(pet.happiness).toBe(max - Math.ceil(max / (6 * hour)))
    })

    it('takes two healing actions to restore a fully depleted health stat', () => {
        const pet = healthy()
        pet.health = 1
        pet.satiety = 0
        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBe(max / 2 + 1)
        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBe(max)
    })

    it('healing suppresses poo and hunger health loss while other needs continue', () => {
        const pet = healthy()
        pet.health = low
        pet.satiety = 0
        pet.poo = true
        pet.medicine()

        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBe(
            low +
                Math.ceil(max / schedules.health.healing) *
                    schedules.health.healingAction,
        )
        expect(pet.satiety).toBe(0)
        expect(pet.poo).toBe(true)

        advance(pet, 1)
        expect(pet.health).toBe(
            low +
                Math.ceil(max / schedules.health.healing) *
                    schedules.health.healingAction -
                2 * Math.ceil(max / schedules.health.starving),
        )
    })

    it('stacks poo with hunger and starving health loss', () => {
        const hungry = healthy()
        hungry.satiety = low - 1
        advance(hungry, 1)
        expect(hungry.health).toBe(
            Math.round(max - max / schedules.health.hungry),
        )

        const soiled = healthy()
        soiled.poo = true
        advance(soiled, 1)
        expect(soiled.health).toBe(Math.round(max - max / schedules.health.poo))

        const combined = healthy()
        combined.satiety = low - 1
        combined.poo = true
        advance(combined, 1)
        expect(combined.health).toBe(
            Math.round(
                max -
                    max / schedules.health.poo -
                    max / schedules.health.hungry,
            ),
        )

        const starving = healthy()
        starving.satiety = 0
        advance(starving, 1)
        expect(starving.health).toBe(
            Math.round(max - max / schedules.health.starving),
        )

        const pooAndStarving = healthy()
        pooAndStarving.satiety = 0
        pooAndStarving.poo = true
        advance(pooAndStarving, 1)
        expect(pooAndStarving.health).toBe(
            Math.round(
                max -
                    max / schedules.health.poo -
                    max / schedules.health.starving,
            ),
        )
    })

    it('recovers health in six hours when fed and clean', () => {
        const pet = healthy()
        pet.health = max - 1
        for (let hourIndex = 0; hourIndex < 6; hourIndex += 1) {
            pet.satiety = max
            advance(pet, hour)
        }
        expect(pet.health).toBe(max)
    })

    it('caps natural recovery from illness at low until medicine is given', () => {
        const pet = healthy()
        pet.health = low - 10
        advance(pet, 1)
        expect(pet.health).toBe(low)

        advance(pet, hour)
        expect(pet.health).toBe(low)

        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBeGreaterThan(normal)
    })

    it('keeps naturally recovered health at low for thirty days without medicine', () => {
        const pet = maxed()
        pet.health = 1
        runtime.speed = minute

        for (
            let elapsedMinutes = 0;
            elapsedMinutes < 30 * 24 * 60;
            elapsedMinutes += 1
        ) {
            pet.energy = max
            pet.happiness = max
            pet.satiety = max
            pet.toilet = max
            pet.poo = false
            advance(pet, 1)
        }

        expect(pet.alive).toBe(true)
        expect(pet.health).toBe(low)

        runtime.speed = 1
        pet.medicine()
        advance(pet, schedules.health.healingAction)
        expect(pet.health).toBeGreaterThan(normal)
    })
})

describe('daily care balance', () => {
    it.each([-60, -30, 30, 60])(
        'survives one week with regular care and a %i-minute meal shift',
        (shiftMinutes) => {
            const pet = maxed()
            runtime.speed = minute
            const mealTimes = [0, 6 * 60, 12 * 60, 18 * 60].map(
                (minuteOfDay) =>
                    (minuteOfDay + shiftMinutes + 24 * 60) % (24 * 60),
            )

            for (
                let elapsedMinutes = 0;
                elapsedMinutes < (7 * day) / minute;
                elapsedMinutes += 1
            ) {
                const minuteOfDay = elapsedMinutes % (24 * 60)
                const hourOfDay = Math.floor(minuteOfDay / 60)
                if (mealTimes.includes(minuteOfDay)) pet.feed()
                if ([2, 10, 16].includes(hourOfDay) && minuteOfDay % 60 === 0) {
                    pet.play()
                }
                if ([8, 20].includes(hourOfDay) && minuteOfDay % 60 === 0) {
                    pet.sleep()
                }
                advance(pet, 1)
                if (pet.poo) pet.clean()
                if (!pet.alive) break
            }

            expect(
                pet.alive,
                `died after ${pet.age / hour} hours with a ${shiftMinutes}-minute meal shift`,
            ).toBe(true)
            expect(pet.age).toBe(7 * day)
        },
    )

    it('automatically sleeps and survives five days without commanded sleep', () => {
        const pet = maxed()
        pet.satiety = high
        pet.feed()
        runtime.speed = minute
        let automaticSleeps = 0

        for (
            let elapsedMinutes = 1;
            elapsedMinutes <= (5 * day) / minute;
            elapsedMinutes += 1
        ) {
            if (elapsedMinutes % ((5 * hour) / minute) === 0) pet.feed()
            const previousAction = pet.action
            advance(pet, 1)
            if (pet.poo) pet.clean()
            if (previousAction !== 'sleeping' && pet.action === 'sleeping') {
                automaticSleeps += 1
            }
            if (!pet.alive) break
        }

        expect(automaticSleeps).toBeGreaterThan(0)
        expect(pet.alive).toBe(true)
        expect(pet.age).toBe(5 * day)
    })

    it.each([-60, -30, 30, 60])(
        'survives a week when six-hour meal times shift by %i minutes',
        (shiftMinutes) => {
            const pet = maxed()
            runtime.speed = minute
            const mealTimes = [0, 6 * 60, 12 * 60, 18 * 60].map(
                (minuteOfDay) =>
                    (minuteOfDay + shiftMinutes + 24 * 60) % (24 * 60),
            )

            for (
                let elapsedMinutes = 0;
                elapsedMinutes < (7 * day) / minute;
                elapsedMinutes += 1
            ) {
                const minuteOfDay = elapsedMinutes % (24 * 60)
                if (mealTimes.includes(minuteOfDay)) pet.feed()
                advance(pet, 1)
                if (pet.poo) pet.clean()
                if (!pet.alive) break
            }

            expect(pet.alive).toBe(true)
            expect(pet.age).toBe(7 * day)
        },
    )

    it('loses more health when poo cleaning is delayed', () => {
        const minimumHealthWithCleaningInterval = (cleaningHours: number) => {
            const pet = maxed()
            pet.satiety = high
            pet.feed()
            runtime.speed = minute

            for (
                let elapsedMinutes = 1;
                elapsedMinutes <= (7 * day) / minute;
                elapsedMinutes += 1
            ) {
                advance(pet, 1)
                if (elapsedMinutes % (5 * 60) === 0) pet.feed()
                if (pet.poo && elapsedMinutes % (cleaningHours * 60) === 0) {
                    pet.clean()
                }
                if (!pet.alive) break
            }

            return pet.age / minute
        }

        const survivalWith12HourCleaning = minimumHealthWithCleaningInterval(12)
        const survivalWith24HourCleaning = minimumHealthWithCleaningInterval(24)
        const survivalWith48HourCleaning = minimumHealthWithCleaningInterval(48)

        expect(survivalWith12HourCleaning).toBeGreaterThan(
            survivalWith24HourCleaning,
        )
        expect(survivalWith24HourCleaning).toBeGreaterThan(
            survivalWith48HourCleaning,
        )
    })

    it('is dead by thirty days when only fed daily and poo is cleaned', () => {
        const pet = maxed()
        pet.satiety = high
        pet.feed()
        runtime.speed = minute

        for (
            let elapsedMinutes = 1;
            elapsedMinutes <= 30 * 24 * 60;
            elapsedMinutes += 1
        ) {
            advance(pet, 1)
            if (pet.poo) pet.clean()
            if (!pet.alive) {
                reportDeath(elapsedMinutes * minute)
                break
            }
            if (elapsedMinutes % (24 * 60) === 0) pet.feed()
        }

        expect(
            pet.alive,
            `still alive after 30 days (health=${pet.health}, satiety=${pet.satiety})`,
        ).toBe(false)
    })

    it('is dead by thirty days when fed every five hours and poo is left', () => {
        const pet = maxed()
        pet.satiety = high
        pet.feed()
        runtime.speed = minute

        for (
            let elapsedMinutes = 1;
            elapsedMinutes <= 30 * 24 * 60;
            elapsedMinutes += 1
        ) {
            advance(pet, 1)
            if (!pet.alive) {
                reportDeath(elapsedMinutes * minute)
                break
            }
            if (elapsedMinutes % (5 * 60) === 0) pet.feed()
        }

        expect(
            pet.alive,
            `still alive after 30 days with health=${pet.health}, satiety=${pet.satiety}, poo=${pet.poo}`,
        ).toBe(false)
    })

    it('survives two days without care when all stats start maxed', () => {
        const pet = maxed()
        advance(pet, 2 * day)
        expect(pet.alive).toBe(true)
    })

    it('is dead after three days without care when all stats start maxed', () => {
        const pet = maxed()
        advance(pet, 3 * day)
        expect(pet.alive).toBe(false)
    })

    it('does not starve when fed once every five hours', () => {
        const pet = maxed()
        let minimumSatiety = pet.satiety

        for (
            let elapsedSeconds = 0;
            elapsedSeconds < 10 * day;
            elapsedSeconds += 1
        ) {
            if (elapsedSeconds % (5 * hour) === 0) pet.feed()
            advance(pet, 1)
            if (pet.poo) pet.clean()
            minimumSatiety = Math.min(minimumSatiety, pet.satiety)
            if (!pet.alive) break
        }

        expect(
            minimumSatiety,
            `minimum satiety was ${minimumSatiety}`,
        ).toBeGreaterThan(0)
        expect(pet.age).toBe(10 * day)
    })

    it('keeps the critter alive for ten days with regular care', () => {
        const pet = healthy()
        pet.satiety = max
        runtime.speed = minute

        for (
            let elapsedMinutes = 0;
            elapsedMinutes < 10 * 24 * 60;
            elapsedMinutes += 1
        ) {
            const minuteOfDay = elapsedMinutes % (24 * 60)
            const hourOfDay = Math.floor(minuteOfDay / 60)
            if (minuteOfDay % (6 * 60) === 0) pet.feed()
            if ([2, 10, 16].includes(hourOfDay) && minuteOfDay % 60 === 0) {
                pet.play()
            }
            if ([8, 20].includes(hourOfDay) && minuteOfDay % 60 === 0) {
                pet.sleep()
            }
            advance(pet, 1)
            if (pet.poo) pet.clean()
            if (!pet.alive) break
        }

        expect(
            pet.alive,
            `died after ${pet.age / hour} hours with health=${pet.health}, energy=${pet.energy}, satiety=${pet.satiety}, happiness=${pet.happiness}, toilet=${pet.toilet}, poo=${pet.poo}`,
        ).toBe(true)
        expect(pet.age).toBe(10 * day)
    })
})

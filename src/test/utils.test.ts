import { describe, expect, it, vi } from 'vitest'

import { duration, now } from '../utils.ts'

describe('time utilities', () => {
    it.each([
        [1000499, 1000],
        [1000500, 1001],
    ])('rounds timestamp %i to %i seconds', (milliseconds, seconds) => {
        vi.spyOn(Date, 'now').mockReturnValue(milliseconds)
        expect(now()).toBe(seconds)
    })

    it.each([
        [0, '0 seconds'],
        [1, '1 second'],
        [59, '59 seconds'],
        [60, '1 minute'],
        [119, '1 minute'],
        [120, '2 minutes'],
        [3599, '59 minutes'],
        [3600, '1 hour'],
        [7200, '2 hours'],
        [86399, '23 hours'],
        [86400, '1 day'],
        [172800, '2 days'],
        [31535999, '364 days'],
        [31536000, '1 year'],
        [63072000, '2 years'],
    ] as const)('formats %i seconds as %s', (seconds, expected) => {
        expect(duration(seconds)).toBe(expected)
    })
})

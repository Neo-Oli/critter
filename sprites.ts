import cleaning from './sprites/cleaning.txt' with { type: 'text' }
import dirty from './sprites/dirty.txt' with { type: 'text' }
import eating from './sprites/eating.txt' with { type: 'text' }
import happy from './sprites/happy.txt' with { type: 'text' }
import hungry from './sprites/hungry.txt' with { type: 'text' }
import idle from './sprites/idle.txt' with { type: 'text' }
import medicine from './sprites/medicine.txt' with { type: 'text' }
import playing from './sprites/playing.txt' with { type: 'text' }
import sad from './sprites/sad.txt' with { type: 'text' }
import sick from './sprites/sick.txt' with { type: 'text' }
import sleeping from './sprites/sleeping.txt' with { type: 'text' }
import tired from './sprites/tired.txt' with { type: 'text' }

export const sprites = {
	cleaning,
	dirty,
	eating,
	happy,
	hungry,
	idle,
	medicine,
	playing,
	sad,
	sick,
	sleeping,
	tired,
} as const

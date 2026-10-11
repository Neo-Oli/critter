---
name: critter-simulations
description: "Use when adding or changing Critter simulation tests, schedule balance scenarios, care routines, lifespan outcomes, or stat interactions in this project."
---

# Critter Simulations

Use this skill for time-advancing behavior and balance tests.

## Test Organization

- Keep direct method, construction, persistence, render-state, and one-tick behavior tests in `src/test/critter.test.ts`.
- Put tests that advance the simulated clock or assess outcomes over time in `src/test/simulate.test.ts`.
- Do not delete existing tests just because behavior or terminology changed. Adapt valid coverage to current stats and actions; remove a case only when its behavior is intentionally gone.

## Simulation Harness

- Reuse the controlled `runtime` clock, `advance(pet, seconds)`, and `healthy()` / `maxed()` helpers in `src/test/simulate.test.ts`.
- `advance` increments `runtime.time` and calls the real `pet.process()` loop. Use it for elapsed-time behavior.
- `healthy()` starts at stage 1; a new Critter starts as a stage-0 egg. Account for the configured stage-0 age when asserting absolute age.
- To isolate one stat interaction, explicitly maintain unrelated needs during each tick. For example, hold happiness at max when measuring feeding, or restore energy and satiety while testing health recovery.
- For deaths, stop at the first dead tick and use the existing `reportDeath(elapsedSeconds)` helper when the measured time is useful.

## Schedule Discipline

- Read timing values from `src/config.ts`; do not duplicate schedule numbers in simulations when the config exports the value.
- Prefer assertions at meaningful boundaries or outcomes over exact per-tick floating-point values. Stat values are integer-rounded.
- Add a failing balance assertion when the requested target is unmet and report the measured outcome. Do not silently retune schedules while adding a test; change schedules only when asked to change balance.
- Cover interactions, not only isolated drains: poo stacks with hunger/starving; healing suppresses health loss while active; unhappiness damages health; sleep recovery is slower while ill; toilet drain depends on satiety.

## Validation

Run the focused file first, then the full suite and type-check:

```sh
pnpm exec vitest run src/test/simulate.test.ts
pnpm test
pnpm run check
pnpm exec eslint src/test/simulate.test.ts
```

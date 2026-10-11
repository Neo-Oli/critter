# Tests

Run `pnpm install`, then `pnpm test`. Run `pnpm test:check` to typecheck
production code, tests, and the Vitest config with TypeScript (also available
as `pnpm run check`). Use `pnpm test:watch` while developing,
or `pnpm exec vitest run src/critter.test.ts` for the simulation tests alone.

The suite exercises the real TypeScript modules and text sprites. Critter tests
replace state storage with in-memory mocks and use a controlled clock. IO and
CLI tests use temporary HOME directories that are removed after each test;
the user's saved critter is never read or written. CLI tests bundle the actual
entry point into a temporary directory and execute it as a subprocess.

## Balance Targets

Accelerated tests run at 60x or 3600x speed without waiting for real time.
All action durations and stat changes still run through the real process loop.

| Behavior                           | Test Range or Schedule                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| Hungry after a hungry-started meal | Between 5 and 7 hours                                                |
| Tired from full energy             | Between 9 and 10 awake hours                                         |
| Sad from full happiness            | Between 7 and 9 hours                                                |
| Dirty from full cleanliness        | Between 22 and 24 hours                                              |
| Sick without food                  | Between 23 and 25 hours                                              |
| Dead without food                  | Between 46 and 50 hours                                              |
| Neglected cleaning                 | Four meals daily do not prevent death between six and seven days     |
| Full care survival                 | Four meals, two sleeps, three plays, one cleaning daily for ten days |

Starvation ranges start with full health and satiety at `high`, representing
a healthy pet after feeding while hungry. New pets have different initial
stats, and injured pets have different survival times.

Whole-second hungry meals finish at or just below `high`, never above it.
Feeding at full satiety starts a 30-second refusal, causes only a small
happiness loss, and does not damage health.
Integer rounding makes cleaning due at about 23.15 hours rather than exactly
24, so the full-care test allows a small cleanliness deficit just before the
next daily cleaning. It requires health within one percent of full, sufficient
energy, and happiness throughout the simulation.

## Need Interactions

- Cleanliness below `low` immediately costs two health per simulation second
  and prevents natural recovery. Cleaning stops this damage and enables recovery;
  there is no dirtiness timer or grace period.
- Starvation takes precedence over dirtiness damage, preserving the food-neglect
  deadlines. Feeding at full satiety does not cause health damage.
- A full critter refuses food for thirty seconds and loses a small amount of
  happiness.
- Playing while tired restores approximately half as much happiness.
- Sleeping still restores energy while starving, but starvation continues.
  Interrupting sleep retains recovered energy and has a small happiness penalty.
- A fed, clean pet naturally recovers thirty health per second. Starvation
  illness can recover within eight hours of feeding and cleaning, without medicine.
  Medicine restores health in ten seconds but does not replace food or cleaning.
- Meal schedules shifted thirty or sixty minutes early or late remain safe
  for a week when daily cleaning is maintained.
- One missed meal can be recovered through normal feeding without medicine.

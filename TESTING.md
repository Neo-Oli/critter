# Testing

Install dependencies with `pnpm install`. The main commands are:

```sh
pnpm test
pnpm exec vitest run --reporter=verbose
pnpm test:watch
pnpm test:snap
pnpm test:check
```

`pnpm test` runs the full suite. Use the verbose command to print every test
case. `pnpm test:snap` updates render snapshots, and `pnpm test:check` runs
TypeScript's no-emit check (also available as `pnpm run check`). To run one
area, use `pnpm exec vitest run src/test/critter.test.ts` or
`pnpm exec vitest run src/test/simulate.test.ts`.

## Test Layout

- `src/test/critter.test.ts` covers direct behavior, construction, persistence,
  single-tick toilet transitions, and rendering.
- `src/test/simulate.test.ts` advances the controlled clock to test schedules
  and longer-term outcomes. It includes daily-care and neglect scenarios.
- `src/test/plain.test.ts` checks rendering and snapshots; snapshots are stored
  under `src/test/__snapshots/`.
- `src/test/io.test.ts` and `src/test/cli.test.ts` use isolated temporary state
  locations. CLI tests bundle the real entry point into a temporary directory
  and run it as a subprocess.

Tests exercise the real TypeScript modules. Vitest's Vite config loads sprite
`.txt` files as text. Simulation tests use a controlled clock and may advance
it by seconds, minutes, or hours without waiting in real time.

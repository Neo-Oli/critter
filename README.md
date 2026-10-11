# critter

A small terminal pet to feed, clean, play with, and put to sleep.

## Install

Requires Node.js 22.12 or newer and pnpm. From this checkout:

```sh
pnpm install
pnpm run build
npm install -g .
critter new
critter
```

## Commands

```text
critter [new|feed|clean|medicine|play|sleep|stop]
```

Run `critter` to check on your pet, `critter -h` for help, or `critter -n`
without Nerd Fonts. **`new` replaces your current pet.**

New critters begin as eggs for five minutes. They become stage 1 for six hours,
then enter stage 2. The egg cannot be cared for and its stats do not change.

Aim for four meals, two sleeps, and three plays daily. Clean whenever poo
appears; depending on satiety, that can happen more than once per day. Time
passes between commands; nothing needs to run in the background.

State is saved to `$HOME/.local/share/critter/state.json`.

## Development

Uses Node.js, TypeScript, and pnpm. `pnpm start` runs the TypeScript source
directly. esbuild bundles TypeScript and text sprites for distribution.

```sh
pnpm install
pnpm run check
pnpm test
pnpm run build
pnpm start -- --help
```

Run `pnpm run build` before installing or packaging the bundled CLI globally;
include `dist/` in that package. Test details are in [TESTING.md](TESTING.md).

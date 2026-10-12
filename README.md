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
critter [new|feed|clean|heal|play|sleep|stop]
```

Run `critter` to check on your pet, `critter -h` for help, or `critter -n`
without Nerd Fonts. **`new` replaces your current pet.**

Use `critter -s` or `critter --short` to print a bear emoticon matching its
current state instead of sprites and stat bars.

New critters begin as eggs for five minutes. They become stage 1 for six hours,
then enter stage 2. The egg cannot be cared for and its stats do not change.

Aim for four meals, two sleeps, and three plays daily. Clean whenever poo
appears; depending on satiety, that can happen more than once per day. Time
passes between commands; nothing needs to run in the background.

State is saved to `$HOME/.local/share/critter/state.json`.

## Library

The package can also be imported as an ES module, with TypeScript types
included. It runs in the browser or in Node.js.

```ts
import { Critter, type CritterData } from 'critter'

const critter = Critter.isAlive() ? new Critter() : Critter.create()

critter.feed()
critter.play()
const data: CritterData = critter.status()
console.log(data.short)
```

Options, for both `new Critter(options)` and `Critter.create(options)`:

| Option    | Default | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| `browser` | `true`  | Save to `localStorage`; `false` uses the CLI state file |
| `debug`   | `false` | Show exact stat values in `plainStats` and `plain`      |

`Critter.isAlive({ browser })` returns whether a living critter is saved.
`new Critter()` loads it and throws `No Critter` if there is none;
`Critter.create()` starts a new one, replacing any existing critter.

`Critter.create({ stage: 1 })` starts at stage `1` instead of the egg.
Creation accepts stage `0` (the default), `1`, or `2`, with fresh stats and
age set to the start of that stage. Loading preserves the saved age and stage.

Actions match the CLI commands: `feed`, `clean`, `heal`, `play`, `sleep`,
`stop`, and `dismiss`, plus `status` to just read the current state. Each
applies the time passed since the last call, saves, and returns a plain object
with the same fields as `critter --json`.

The critter is kept in memory after it is loaded. Changes made elsewhere, for
example by the CLI using the same state file, are overwritten on the next
action.

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

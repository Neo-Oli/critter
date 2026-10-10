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

Aim for four meals, two sleeps, three plays, and one cleaning daily. Time passes
between commands; nothing needs to run in the background.

State is saved to `$HOME/.local/share/critter/state.json`.

## Development

Uses Node.js, TypeScript, and pnpm. esbuild bundles the TypeScript and text
sprites into a Node.js executable.

```sh
pnpm install
pnpm run check
pnpm test
pnpm run build
pnpm start -- --help
```

Rebuild and include `dist/` when changing the source. Test details are in
[TESTING.md](TESTING.md).

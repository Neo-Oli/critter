---
name: critter-staged-sprites
description: 'Use when changing Critter stages, sprite assets, render layers, sprite conversion, or render snapshots in this project.'
---

# Critter Stages and Sprites

Use this skill for age-based stages and terminal sprite rendering.

## Stage Rules

- Stage durations live in `src/config.ts` as `stagingSchedule`; derive the current stage from age rather than persisting a separate stage field.
- Stage 0 is the egg: render only its idle sprite and age, allow no care commands, and advance age without processing other stats.
- Stage 1 lasts for its configured duration; stage 2 is the final stage. Both use normal action/stat processing.
- Stage 1 and stage 2 have separate body sprite sets. Top and bottom sprites are shared across stages.

## Sprite Assets and Rendering

- Source PNGs live in `sprite_source/`; generated text sprites live in `src/sprites/` with the same stage subdirectories.
- Stage body assets belong under `stage-0`, `stage-1`, or `stage-2`. Stage 0 currently needs only `idle`; shared overlays such as food, ill, medicine, poo, and toy stay at the sprite root.
- `loadSprite` takes an options object. It truncates/pads rows to `width`, reverses after width normalization, then appends optional fixed `padding` spaces.
- `plain()` trims trailing whitespace at the final output boundary. Preserve intentional leading/internal sprite spacing.
- Render state carries the stage so the renderer selects the correct body sprite set.

## Conversion Safety

`pnpm convert` runs `convert.sh`. The script removes and regenerates the entire `src/sprites/` directory from `sprite_source/`, including all stage subdirectories. **Do not run it unless regeneration is explicitly intended.** It also requires ImageMagick (`magick`) and the installed pixel-to-ASCII tool. Empty PNG placeholders produce empty text sprites.

## Snapshot Workflow

- Snapshot coverage belongs in `src/test/plain.test.ts`; generated snapshots are in `src/test/__snapshots__/plain.test.ts.snap`.
- Use `noNerdFonts: true` for snapshots so output is portable.
- Cover reachable `(stage, body, top, bottom)` combinations, not an arbitrary Cartesian product of impossible render states. Stage 0 has only its idle combination.
- Snapshot values are newline-framed so quotes appear on separate lines. Update snapshots only after an intentional rendering change.

Validate with:

```sh
pnpm exec vitest run src/test/plain.test.ts
pnpm test
pnpm run check
pnpm exec eslint src/plain.ts src/test/plain.test.ts
```

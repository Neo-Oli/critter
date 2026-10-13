// src/utils.ts
var now = () => Math.round(Date.now() / 1e3);
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var duration = (seconds) => {
  const units = [
    ["year", 31536e3],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1]
  ];
  const [unit, size] = units.find(([, size2]) => seconds >= size2) ?? units[4];
  const count = Math.floor(seconds / size);
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
};
var actionDuration = (seconds) => {
  if (seconds <= hour) return duration(seconds);
  const hours = Math.floor(seconds / hour);
  const minutes = Math.floor(seconds % hour / minute);
  return `${hours}h${minutes}m`;
};
var statIcons = {
  age: ["A", "\u{F0954}"],
  energy: ["E", "\u{F12A3}"],
  happiness: ["H", "\u{F0C71}"],
  health: ["+", "\uE221"],
  satiety: ["S", "\u{F025B}"],
  toilet: ["T", "\u{F09AB}"]
};
var statIcon = (name, noNerdFonts) => statIcons[name][noNerdFonts ? 0 : 1];

// src/config.ts
var max = 1e6;
var high = Math.round(max / 4 * 3);
var normal = Math.round(max / 2);
var low = Math.round(max / 4);
var binName = "critter";
var penalty = 0.1;
var speed = 1;
var stagingSchedule = {
  stage0: 5 * minute,
  stage1: 6 * hour
};
var schedules = {
  energy: {
    awake: day,
    playing: 10 * 2 * minute,
    sleeping: 2 * hour,
    sleepingSick: 4 * hour
  },
  happiness: {
    idle: 6 * hour,
    playing: 2 * minute,
    playingTired: 4 * minute
  },
  health: {
    happinessLow: 6 * day,
    happinessZero: 3 * day,
    healing: 20,
    healingAction: 10,
    hungry: 4 * day,
    poo: 2 * day,
    recovery: 12 * hour,
    starving: 2 * day
  },
  satiety: {
    eating: 2 * minute,
    idle: day / 3,
    playing: 5 * 2 * minute
  },
  toilet: {
    high: day / 3,
    low: day,
    normal: day / 2
  }
};

// src/sprites/food.txt
var food_default = "   \u2584\u2580\n\u2584\u2580\u2580\u2580\u2580\u2580\u2584\n\u2588  \u2580\u2588 \u2588\n\u2580\u2584\u2584\u2584\u2584\u2584\u2580\n";

// src/sprites/heal.txt
var heal_default = " \u2588\u2580\u2580\u2580\u2588\n\u2588  \u2584  \u2588\n\u2588 \u2580\u2588\u2580 \u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/ill.txt
var ill_default = "\u2584\u2588\u2580\u2588\u2580\u2588\u2584\n\u2588\u2588\u2584\u2588\u2584\u2588\u2588\n\u2580\u2588\u2588\u2584\u2588\u2588\u2580\n \u2580 \u2580 \u2580\n";

// src/sprites/poo.txt
var poo_default = "\u2584\u2580     \u2584\n \u2580 \u2588\u2584 \u2580\u2584\n  \u2588\u2588\u2584\u2580\u2584\n\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2584\n";

// src/sprites/stage-0/idle.txt
var idle_default = "\n\n\n     \u2584\u2580\u2580\u2580\u2584\n    \u2584\u2580\u2584  \u2580\u2584\n   \u2584\u2580   \u2580 \u2580\u2584\n   \u2580\u2584 \u2580 \u2584 \u2584\u2580\n    \u2580\u2584\u2584\u2584\u2584\u2584\u2580\n";

// src/sprites/stage-1/dead.txt
var dead_default = "  \u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2584\u2580        \u2584\u2584\u2584 \u2580\u2584\n\u2588 \u2580\u2580\u2580\u2580   \u2588\u2580\u2588\u2580\u2588 \u2588\n\u2588 \u2580\u2580\u2580\u2580   \u2580\u2588\u2588\u2588\u2580 \u2588\n\u2588 \u2580\u2580\u2580\u2580    \u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/happy.txt
var happy_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588 \u2580 \u2580 \u2588\n     \u2588 \u2584\u2584\u2580 \u2588\n     \u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/hungry.txt
var hungry_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588 \u2580 \u2580 \u2588\n     \u2588 \u2580\u2580\u2588 \u2588\n     \u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/idle.txt
var idle_default2 = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588 \u2588 \u2588 \u2588\n     \u2588  \u2584  \u2588\n     \u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/refusing.txt
var refusing_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588 \u2580 \u2580 \u2588\n     \u2588 \u2584\u2580\u2584 \u2588\n     \u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/sad.txt
var sad_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588\u2588\u2580 \u2588\u2580\u2588\n     \u2588\u2580 \u2584\u2580 \u2588\n     \u2588\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-1/sick.txt
var sick_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588 \u2584 \u2584 \u2588\n     \u2588\u2580\u2580 \u2580\u2580\u2588\n     \u2588\u2584\u2584\u2588\u2584\u2584\u2588\n";

// src/sprites/stage-1/sleeping.txt
var sleeping_default = "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2584\u2584\u2584 \u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2580\u2580\u2580\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2580\u2580\u2580\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2584\u2584\u2584\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n";

// src/sprites/stage-1/tired.txt
var tired_default = "\n\n\n\n     \u2584\u2580\u2580\u2580\u2580\u2580\u2584\n     \u2588     \u2588\n     \u2588\u2580\u2580 \u2580\u2580\u2588\n     \u2588\u2584\u2584\u2588\u2584\u2584\u2588\n";

// src/sprites/stage-2/dead.txt
var dead_default2 = "  \u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2584\u2580        \u2584\u2584\u2584 \u2580\u2584\n\u2588 \u2580\u2580\u2580\u2580   \u2588\u2580\u2588\u2580\u2588 \u2588\n\u2588 \u2580\u2580\u2580\u2580   \u2580\u2588\u2588\u2588\u2580 \u2588\n\u2588 \u2580\u2580\u2580\u2580    \u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/stage-2/happy.txt
var happy_default2 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2580   \u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584\u2584\u2580 \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/hungry.txt
var hungry_default2 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588  \u2584 \u2584  \u2588\n\u2588  \u2584\u2584\u2584  \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588  \u2580\u2580\u2588  \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/idle.txt
var idle_default3 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588   \u2588 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/refusing.txt
var refusing_default2 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588 \u2584   \u2584 \u2588\n\u2588 \u2580\u2580 \u2580\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588 \u2584\u2580\u2580\u2580\u2584 \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/sad.txt
var sad_default2 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588\u2580 \u2588\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588 \u2580 \u2584\u2580  \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/sick.txt
var sick_default2 = "\n\u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2588 \u2584\u2588 \u2588\u2584 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/stage-2/sleeping.txt
var sleeping_default2 = "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2584\u2584\u2584 \u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2580\u2580\u2580\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2580\u2580\u2580\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2584\u2584\u2584\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n";

// src/sprites/stage-2/tired.txt
var tired_default2 = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2580\u2580 \u2580\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2588   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/toy.txt
var toy_default = " \u2584\u2580\u2580\u2580\u2580\u2584\n\u2588   \u2580\u2584 \u2588\n\u2588      \u2588\n \u2580\u2584\u2584\u2584\u2584\u2580\n";

// src/plain.ts
var spriteWidth = 16;
var spriteHeight = 8;
var iconWidth = 8;
var iconHeight = 4;
var sharedSprites = {
  food: food_default,
  heal: heal_default,
  ill: ill_default,
  none: "",
  poo: poo_default,
  toy: toy_default
};
var stageSprites = {
  0: { idle: idle_default },
  1: {
    dead: dead_default,
    happy: happy_default,
    hungry: hungry_default,
    idle: idle_default2,
    refusing: refusing_default,
    sad: sad_default,
    sick: sick_default,
    sleeping: sleeping_default,
    tired: tired_default
  },
  2: {
    dead: dead_default2,
    happy: happy_default2,
    hungry: hungry_default2,
    idle: idle_default3,
    refusing: refusing_default2,
    sad: sad_default2,
    sick: sick_default2,
    sleeping: sleeping_default2,
    tired: tired_default2
  }
};
var loadSprite = ({
  height = spriteHeight,
  name,
  padding = 0,
  reverse = false,
  stage = 2,
  width = spriteWidth
}) => {
  const sprite = sharedSprites[name] ?? stageSprites[stage][name] ?? "";
  return sprite.split(/\r?\n/).concat(Array(height).fill("")).slice(0, height).map((line) => {
    const sized = line.slice(0, width).padEnd(width);
    const oriented = reverse ? sized.split("").reverse().join("") : sized;
    return `${oriented}${" ".repeat(padding)}`;
  });
};
var plainSprites = ({ state }) => {
  const { bottom, reverse, sprite, top } = state;
  const topSprite = loadSprite({
    height: iconHeight,
    name: top,
    stage: state.stage,
    width: iconWidth
  });
  const bottomSprite = loadSprite({
    height: iconHeight,
    name: bottom,
    stage: state.stage,
    width: iconWidth
  });
  const output = loadSprite({
    height: spriteHeight,
    name: sprite,
    padding: 1,
    reverse,
    stage: state.stage,
    width: spriteWidth
  });
  for (let i = 0; i < iconHeight; i++) {
    output[i] += topSprite[i];
    output[i + iconHeight] += bottomSprite[i];
  }
  return output.map((line) => line.trimEnd()).join("\n");
};
var plainStats = ({
  actionTime,
  age,
  debug = false,
  energy,
  happiness,
  health,
  noNerdFonts,
  satiety,
  state,
  toilet
}) => {
  const stat = (name, value) => {
    const barValue = Math.round(value / max * 10);
    let empty, full, half;
    if (noNerdFonts) {
      empty = " ";
      half = "\u258C";
      full = "\u2588";
    } else {
      empty = "\u{F02D5}";
      half = "\u{F06DE}";
      full = "\u{F02D1}";
    }
    const maxBarValue = Math.min(barValue, 10);
    let bar2 = full.repeat(Math.floor(maxBarValue / 2));
    if (maxBarValue % 2) {
      bar2 += half;
    }
    bar2 += empty.repeat(
      Math.max(0, 5 - Math.floor(barValue / 2 + maxBarValue % 2))
    );
    if (noNerdFonts) {
      bar2 = `\u2502${bar2}\u2502`;
    }
    return `${statIcon(name, noNerdFonts)} ${bar2}${debug ? ` (${value})` : ""}`;
  };
  const remaining = actionTime > 0 ? ` (${actionDuration(actionTime)})` : "";
  const output = [];
  const padding = "  ";
  const ageFormatted = `${statIcon("age", noNerdFonts)} ${duration(age)}`;
  if (state.stage !== 0) {
    output.push(state.main.toUpperCase() + remaining);
    output.push(
      [stat("happiness", happiness), stat("satiety", satiety)].join(
        padding
      )
    );
    output.push(
      [stat("energy", energy), stat("health", health)].join(padding)
    );
    output.push([stat("toilet", toilet), ageFormatted].join(padding));
  } else {
    output.push(ageFormatted);
  }
  return output.map((line) => line.trimEnd()).join("\n");
};
var plain = (options) => `${plainSprites(options)}

${plainStats(options)}`;

// src/short.ts
var emoticon = ({ noNerdFonts = true, state }) => {
  const baseSet = {
    dead: "[RIP]",
    happy: "\u0295^\u1D25^\u0294",
    hungry: "\u0295\xBA\u1D25\xBA\u0294",
    idle: "\u0295\u2022\u1D25\u2022\u0294",
    refusing: "\u0295\u02CB\u1D25\u02CA\u0294",
    sad: "\u0295\uFF1B\u1D25\uFF1B\u0294",
    sick: "\u0295\xD7\u1D25\xD7\u0294",
    sleeping: "zZz",
    tired: "\u0295-\u1D25-\u0294"
  };
  const bears = {
    0: { idle: "( . )" },
    1: baseSet,
    2: baseSet
  };
  return `${state.stage === 0 ? bears[0].idle : bears[state.stage][state.sprite]}${conditions({ noNerdFonts, state })}`;
};
var bar = (value, icon) => {
  const bars2 = " \u2581\u2582\u2583\u2585\u2587\u2588".split("");
  const barValue = Math.min(
    bars2.length - 1,
    Math.max(0, Math.ceil(value / max * (bars2.length - 1)))
  );
  return `${icon}${bars2[barValue]}`;
};
var bars = ({
  energy,
  happiness,
  health,
  noNerdFonts,
  satiety,
  toilet
}) => {
  return [
    bar(happiness, statIcon("happiness", noNerdFonts)),
    bar(satiety, statIcon("satiety", noNerdFonts)),
    bar(energy, statIcon("energy", noNerdFonts)),
    bar(health, statIcon("health", noNerdFonts)),
    bar(toilet, statIcon("toilet", noNerdFonts))
  ].join(" ");
};
var conditions = ({
  noNerdFonts,
  state
}) => {
  const icons = {
    food: ["\u2668", "\u{F025B}"],
    heal: ["\u271A", "\uE221"],
    ill: ["!", "\u{F068C}"],
    none: ["", ""],
    poo: ["\u224B", "\uEEAF "],
    toy: ["\u25CB", "\u{F0A26}"]
  };
  return [state.bottom, state.top].map((condition) => icons[condition][noNerdFonts ? 0 : 1]).filter(Boolean).join("");
};
var short = ({
  energy,
  happiness,
  health,
  noNerdFonts,
  satiety,
  state,
  toilet
}) => {
  return `${emoticon({ noNerdFonts, state })} ${bars({ energy, happiness, health, noNerdFonts, satiety, toilet })}`;
};

// src/data.ts
var data = (options) => {
  const {
    action,
    actionTime,
    alert,
    energy,
    happiness,
    health,
    poo,
    satiety,
    state,
    toilet
  } = options;
  const nerdOptions = { ...options, noNerdFonts: false };
  const noNerdOptions = { ...options, noNerdFonts: true };
  return {
    action,
    actionTime,
    alert,
    Bars: bars({
      energy,
      happiness,
      health,
      noNerdFonts: false,
      satiety,
      toilet
    }),
    "Bars-nonerd": bars({
      energy,
      happiness,
      health,
      noNerdFonts: true,
      satiety,
      toilet
    }),
    emoticon: emoticon({ noNerdFonts: false, state }),
    "emoticon-nonerd": emoticon({ noNerdFonts: true, state }),
    Energy: energy,
    Happy: happiness,
    Health: health,
    Hunger: satiety,
    plain: plain(nerdOptions),
    "plain-nonerd": plain(noNerdOptions),
    plainSprites: plainSprites(options),
    plainStats: plainStats(nerdOptions),
    "plainStats-nonerd": plainStats(noNerdOptions),
    poo,
    short: short(nerdOptions),
    "short-nonerd": short(noNerdOptions),
    Toilet: toilet
  };
};

// src/io.ts
var fs = () => process.getBuiltinModule("node:fs");
var path = () => `${process.env.HOME}/.local/share/${binName}/state.json`;
var loadState = (browser = false) => {
  if (browser) {
    const saved = localStorage.getItem(binName);
    return saved === null ? void 0 : JSON.parse(saved);
  }
  try {
    return JSON.parse(
      fs().readFileSync(path(), "utf8")
    );
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT")
      throw error;
  }
};
var saveState = (state, browser = false) => {
  if (browser) {
    localStorage.setItem(binName, JSON.stringify(state));
    return;
  }
  const file = path();
  fs().mkdirSync(file.substring(0, file.lastIndexOf("/")), {
    recursive: true
  });
  fs().writeFileSync(file, JSON.stringify(state, null, 4));
};

// src/json.ts
var json = (options) => {
  return JSON.stringify(data(options), null, 2);
};

// src/critter.ts
var alertFlags = {
  dead: 1 << 6,
  hungry: 1 << 0,
  ill: 1 << 2,
  poo: 1 << 4,
  sad: 1 << 5,
  sick: 1 << 1,
  tired: 1 << 3
};
var set = (value, smin = 0, smax = max) => {
  return Math.round(Math.min(smax, Math.max(smin, value)));
};
var changeBySchedule = (value, secondsPerCycle, direction) => set(value + Math.ceil(max / secondsPerCycle) * direction);
var applyPenalty = (value) => set(value * (1 - penalty));
var Critter = class {
  action = "idle";
  actionTime = 0;
  age = 0;
  alert = false;
  alive = true;
  birth = 0;
  energy = normal;
  error = void 0;
  happiness = normal;
  health = high;
  mood = [];
  poo = false;
  satiety = low;
  time = this.birth;
  toilet = low;
  get stage() {
    if (this.age < stagingSchedule.stage0) return 0;
    if (this.age < stagingSchedule.stage0 + stagingSchedule.stage1) return 1;
    return 2;
  }
  activeAlerts = 0;
  browser;
  constructor({ browser = false, command, stage = 0 }) {
    this.browser = browser;
    let state;
    try {
      state = loadState(browser);
    } catch {
      state = {};
    }
    if (command === "new") {
      this.age = stage === 0 ? 0 : stagingSchedule.stage0 + (stage === 2 ? stagingSchedule.stage1 : 0);
      this.time = now();
      this.birth = this.time - this.age;
    } else {
      this.birth = state?.birth ?? this.birth;
      this.age = state?.age ?? this.age;
      this.satiety = set(state?.satiety ?? this.satiety);
      this.happiness = set(state?.happiness ?? this.happiness);
      this.energy = set(state?.energy ?? this.energy);
      this.toilet = set(state?.toilet ?? this.toilet);
      this.health = set(state?.health ?? this.health);
      this.poo = state?.poo ?? this.poo;
      this.alert = state?.alert ?? this.alert;
      this.actionTime = state?.actionTime ?? this.actionTime;
      this.action = state?.action ?? this.action;
      this.time = state?.time ?? this.time;
      if (!this.birth) {
        this.error = "No Critter. Run `critter new` to birth one.";
        return;
      }
    }
    this.activeAlerts = this.getAlertConditions();
    this.act(command);
  }
  act = (command) => {
    if (this.stage === 0) {
      this.action = "idle";
      this.actionTime = 0;
    }
    this.process();
    if (command === "feed") {
      this.feed();
    }
    if (command === "clean") {
      this.clean();
    }
    if (command === "heal") {
      this.heal();
    }
    if (command === "play") {
      this.play();
    }
    if (command === "sleep") {
      this.sleep();
    }
    if (command === "stop") {
      this.stop();
    }
    if (command === "dismiss") {
      this.dismiss();
    }
    this.updateMood();
    saveState(this.persistedState(), this.browser);
  };
  clean = () => {
    if (this.stage === 0) return;
    this.poo = false;
  };
  data = ({ debug }) => data(this.dataOptions({ debug }));
  die = () => {
    this.action = "idle";
    this.actionTime = 0;
    this.alive = false;
    this.mood = ["dead"];
    this.updateAlert();
  };
  dismiss = () => {
    this.alert = false;
  };
  feed = () => {
    if (this.stage === 0) return;
    if (this.poo) this.health = applyPenalty(this.health);
    if (this.satiety > high) {
      this.refuse();
      return;
    }
    this.action = "eating";
    this.actionTime = this.satiety < low ? Math.floor(
      (high - this.satiety) / max * schedules.satiety.eating
    ) : minute;
  };
  getCritterState = () => {
    if (this.stage === 0)
      return {
        bottom: "none",
        main: "idle",
        reverse: false,
        sprite: "idle",
        stage: 0,
        top: "none"
      };
    if (!this.alive)
      return {
        bottom: "none",
        main: "dead",
        reverse: false,
        sprite: "dead",
        stage: this.stage,
        top: "none"
      };
    const moodPriority = [
      "dead",
      "sick",
      "tired",
      "hungry",
      "sad",
      "happy"
    ];
    const mood = moodPriority.find((priority) => this.mood.includes(priority)) ?? "idle";
    const main = this.action !== "idle" ? this.action : mood;
    return {
      bottom: main === "playing" ? "toy" : main === "eating" ? "food" : this.poo ? "poo" : "none",
      main,
      reverse: ["eating", "playing"].includes(main),
      sprite: ["eating", "healing", "playing"].includes(main) ? mood : main,
      stage: this.stage,
      top: this.action === "healing" ? "heal" : this.health < low ? "ill" : "none"
    };
  };
  heal = () => {
    if (this.stage === 0) return;
    this.action = "healing";
    this.actionTime = schedules.health.healingAction;
  };
  json = ({ debug }) => json(this.dataOptions({ debug }));
  persistedState = () => {
    const {
      action,
      actionTime,
      age,
      alert,
      birth,
      energy,
      happiness,
      health,
      poo,
      satiety,
      toilet
    } = this;
    return {
      action,
      actionTime,
      age,
      alert,
      birth,
      energy,
      happiness,
      health,
      poo,
      satiety,
      time: now(),
      toilet
    };
  };
  plain = ({ debug, noNerdFonts }) => plain({
    actionTime: this.actionTime,
    age: this.age,
    debug,
    energy: this.energy,
    happiness: this.happiness,
    health: this.health,
    noNerdFonts,
    satiety: this.satiety,
    state: this.getCritterState(),
    toilet: this.toilet
  });
  play = () => {
    if (this.stage === 0) return;
    this.action = "playing";
    this.actionTime = 2 * minute;
  };
  process = () => {
    const currentTime = now();
    const elapsed = Math.max(
      0,
      Math.floor((currentTime - this.time) * speed)
    );
    this.time = currentTime;
    if (this.health === 0) {
      if (this.stage !== 0) {
        this.die();
        return;
      }
    }
    for (let tick = 0; tick < elapsed; tick += 1) {
      this.age += 1;
      if (this.stage === 0) continue;
      if (this.health === 0) {
        this.die();
        return;
      }
      if (this.actionTime <= 0) this.action = "idle";
      const healing = this.action === "healing";
      if (this.action === "eating") {
        this.satiety = changeBySchedule(
          this.satiety,
          schedules.satiety.eating,
          1
        );
        if (this.satiety >= max) this.refuse();
      } else {
        this.satiety = changeBySchedule(
          this.satiety,
          this.action === "playing" ? schedules.satiety.playing : schedules.satiety.idle,
          -1
        );
      }
      if (this.action === "sleeping") {
        this.energy = changeBySchedule(
          this.energy,
          this.health < low ? schedules.energy.sleepingSick : schedules.energy.sleeping,
          1
        );
        if (this.energy >= max) {
          this.energy = max;
          this.action = "idle";
          this.actionTime = 0;
        }
      } else {
        this.energy = changeBySchedule(
          this.energy,
          this.action === "playing" ? schedules.energy.playing : schedules.energy.awake,
          -1
        );
      }
      if (healing) {
        this.health = changeBySchedule(
          this.health,
          schedules.health.healing,
          1
        );
      }
      if (this.action === "playing") {
        this.happiness = changeBySchedule(
          this.happiness,
          this.energy < low ? schedules.happiness.playingTired : schedules.happiness.playing,
          1
        );
      } else {
        this.happiness = changeBySchedule(
          this.happiness,
          schedules.happiness.idle,
          -1
        );
      }
      this.actionTime = set(this.actionTime - 1, 0, Infinity);
      if (this.actionTime === 0) this.action = "idle";
      if (!healing) {
        if (this.poo) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.poo,
            -1
          );
        }
        if (this.happiness === 0) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.happinessZero,
            -1
          );
        } else if (this.happiness < low) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.happinessLow,
            -1
          );
        }
        if (this.satiety === 0) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.starving,
            -1
          );
        } else if (this.satiety < low) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.hungry,
            -1
          );
        } else if (!this.poo && this.happiness >= low) {
          if (this.health < low) {
            this.health = Math.min(
              low,
              changeBySchedule(
                this.health,
                schedules.health.recovery,
                1
              )
            );
          } else if (this.health > low) {
            this.health = changeBySchedule(
              this.health,
              schedules.health.recovery,
              1
            );
          }
        }
      }
      const toiletSchedule = this.satiety > high ? schedules.toilet.high : this.satiety > normal ? schedules.toilet.normal : this.satiety > low ? schedules.toilet.low : void 0;
      if (toiletSchedule !== void 0) {
        this.toilet = changeBySchedule(this.toilet, toiletSchedule, -1);
        if (this.toilet <= 0) {
          this.poo = true;
          this.toilet = max;
        }
      }
      if (this.health === 0) {
        this.die();
        return;
      }
      if (this.energy === 0 && this.action !== "sleeping") {
        this.sleep();
        this.health = applyPenalty(this.health);
        this.happiness = applyPenalty(this.happiness);
      }
      this.updateAlert();
    }
    if (this.stage !== 0) this.updateMood();
  };
  refuse = () => {
    if (this.stage === 0) return;
    this.action = "refusing";
    this.actionTime = 30;
    this.happiness = applyPenalty(this.happiness);
  };
  short = ({ noNerdFonts }) => short({
    actionTime: this.actionTime,
    energy: this.energy,
    happiness: this.happiness,
    health: this.health,
    noNerdFonts,
    satiety: this.satiety,
    state: this.getCritterState(),
    toilet: this.toilet
  });
  sleep = () => {
    if (this.stage === 0) return;
    if (this.energy >= normal) {
      this.refuse();
      return;
    }
    this.action = "sleeping";
    this.actionTime = schedules.energy.sleeping;
  };
  stop = () => {
    if (this.stage === 0) return;
    if (["eating", "sleeping"].includes(this.action)) {
      this.happiness = applyPenalty(this.happiness);
    }
    this.action = "idle";
    this.actionTime = 0;
  };
  updateMood = () => {
    this.mood = [];
    if (this.satiety < low) {
      this.mood.push("hungry");
    }
    if (this.health < normal) {
      this.mood.push("sick");
    }
    if (this.energy < low) {
      this.mood.push("tired");
    }
    if (this.happiness > high) {
      this.mood.push("happy");
    } else if (this.happiness < low) {
      this.mood.push("sad");
    }
    this.updateAlert();
  };
  dataOptions = ({ debug }) => ({
    action: this.action,
    actionTime: this.actionTime,
    age: this.age,
    alert: this.alert,
    debug,
    energy: this.energy,
    happiness: this.happiness,
    health: this.health,
    poo: this.poo,
    satiety: this.satiety,
    state: this.getCritterState(),
    toilet: this.toilet
  });
  getAlertConditions = () => (this.satiety < low ? alertFlags.hungry : 0) | (this.health < normal ? alertFlags.sick : 0) | (this.health < low ? alertFlags.ill : 0) | (this.energy < low ? alertFlags.tired : 0) | (this.poo ? alertFlags.poo : 0) | (this.happiness < low ? alertFlags.sad : 0) | (!this.alive ? alertFlags.dead : 0);
  updateAlert = () => {
    const currentAlerts = this.getAlertConditions();
    if ((currentAlerts & ~this.activeAlerts) !== 0) {
      this.alert = true;
    }
    this.activeAlerts = currentAlerts;
  };
};

// src/lib.ts
var Critter2 = class _Critter {
  debug;
  engine;
  // Loads the saved critter; throws if there is none.
  constructor({ browser = true, debug = false } = {}) {
    this.debug = debug;
    this.engine = new Critter({ browser });
    if (this.engine.error) throw new Error(this.engine.error);
  }
  static create = (options) => {
    new Critter({
      browser: options?.browser ?? true,
      command: "new",
      stage: options?.stage
    });
    return new _Critter(options);
  };
  static isAlive = ({
    browser = true
  } = {}) => {
    const engine = new Critter({ browser });
    return !engine.error && engine.alive;
  };
  clean = () => this.run("clean");
  dismiss = () => this.run("dismiss");
  feed = () => this.run("feed");
  heal = () => this.run("heal");
  play = () => this.run("play");
  sleep = () => this.run("sleep");
  status = () => this.run(void 0);
  stop = () => this.run("stop");
  run(command) {
    this.engine.act(command);
    return this.engine.data({ debug: this.debug });
  }
};
export {
  Critter2 as Critter
};

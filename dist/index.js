#!/usr/bin/env node

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

// src/config.ts
var max = 1e6;
var high = Math.round(max / 4 * 3);
var normal = Math.round(max / 2);
var low = Math.round(max / 4);
var binName = "critter";
var happinessPenalty = 1e4;
var speed = 1;
var schedules = {
  energy: {
    awake: day,
    playing: 10 * 2 * minute,
    sleeping: 2 * hour
  },
  happiness: {
    idle: 6 * hour,
    playing: 2 * minute,
    playingTired: 4 * minute
  },
  health: {
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

// src/io.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
var path = `${process.env.HOME}/.local/share/${binName}/state.json`;
var loadState = () => {
  try {
    return JSON.parse(
      readFileSync(path, "utf8")
    );
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT")
      throw error;
  }
};
var saveState = (state) => {
  mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 4));
};

// src/sprites/dead.txt
var dead_default = "  \u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2584\u2580        \u2584\u2584\u2584 \u2580\u2584\n\u2588 \u2580\u2580\u2580\u2580   \u2588\u2580\u2588\u2580\u2588 \u2588\n\u2588 \u2580\u2580\u2580\u2580   \u2580\u2588\u2588\u2588\u2580 \u2588\n\u2588 \u2580\u2580\u2580\u2580    \u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/food.txt
var food_default = "   \u2584\u2580\n\u2584\u2580\u2580\u2580\u2580\u2580\u2584\n\u2588  \u2580\u2588 \u2588\n\u2580\u2584\u2584\u2584\u2584\u2584\u2580\n";

// src/sprites/happy.txt
var happy_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2580   \u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584\u2584\u2580 \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/healing.txt
var healing_default = "            \u2580\u2584\n        \u2580\u2584  \u2584\u2580\u2580\u2584\n       \u2584\u2580 \u2580\u2588\n     \u2584\u2580    \u2584\u2580\u2584\n   \u2584\u2588\u2588\u2588\u2584 \u2584\u2580\n   \u2588\u2588\u2588\u2588\u2588\u2580\n  \u2584\u2580\u2580\u2580\u2580\n\u2584\u2580\n";

// src/sprites/hungry.txt
var hungry_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588  \u2584 \u2584  \u2588\n\u2588  \u2584\u2584\u2584  \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588  \u2580\u2580\u2588  \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/idle.txt
var idle_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588   \u2588 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/poo.txt
var poo_default = "\u2584\u2580     \u2584\n \u2580 \u2588\u2584 \u2580\u2584\n  \u2588\u2588\u2584\u2580\u2584\n\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2584\n";

// src/sprites/refusing.txt
var refusing_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588 \u2584   \u2584 \u2588\n\u2588 \u2580\u2580 \u2580\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588 \u2584\u2580\u2580\u2580\u2584 \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/sad.txt
var sad_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588\u2580 \u2588\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588 \u2580 \u2584\u2580  \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/sick.txt
var sick_default = "\n\u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2588 \u2584\u2588 \u2588\u2584 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/sleeping.txt
var sleeping_default = "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2584\u2584\u2584 \u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2580\u2580\u2580\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2580\u2580\u2580\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2580\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n\u2588\u2588\u2588\u2588\u2584\u2584\u2584\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n";

// src/sprites/tired.txt
var tired_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2580\u2580 \u2580\u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2588   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/toy.txt
var toy_default = " \u2584\u2580\u2580\u2580\u2580\u2584\n\u2588   \u2580\u2584 \u2588\n\u2588      \u2588\n \u2580\u2584\u2584\u2584\u2584\u2580\n";

// src/plain.ts
var spriteWidth = 16;
var spriteHeight = 8;
var iconWidth = 8;
var iconHeight = 4;
var loadSprite = (name, width = spriteWidth, height = spriteHeight, reverse = false) => {
  const sprites = {
    dead: dead_default,
    food: food_default,
    happy: happy_default,
    healing: healing_default,
    hungry: hungry_default,
    idle: idle_default,
    none: "",
    poo: poo_default,
    refusing: refusing_default,
    sad: sad_default,
    sick: sick_default,
    sleeping: sleeping_default,
    tired: tired_default,
    toy: toy_default
  };
  return sprites[name].split(/\r?\n/).concat(Array(height).fill("")).slice(0, height).map(
    (line) => reverse ? line.padEnd(width).split("").reverse().join("") : line
  );
};
var plain = ({
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
  const { bottom, main, reverse, sprite, top } = state;
  const topSprite = loadSprite(top, iconWidth, iconHeight);
  const bottomSprite = loadSprite(bottom, iconWidth, iconHeight);
  const output = loadSprite(sprite, spriteWidth, spriteHeight, reverse);
  for (let i = 0; i < iconHeight; i++) {
    output[i] += topSprite[i];
    output[i + iconHeight] += bottomSprite[i];
  }
  const stat = (name, value) => {
    const barValue = Math.round(value / max * 10);
    let empty, full, half;
    if (noNerdFonts) {
      empty = "\u25CB";
      half = "\u25D0";
      full = "\u25CF";
    } else {
      empty = "\u{F02D5}";
      half = "\u{F06DE}";
      full = "\u{F02D1}";
    }
    const maxBarValue = Math.min(barValue, 10);
    let bar = full.repeat(Math.floor(maxBarValue / 2));
    if (maxBarValue % 2) {
      bar += half;
    }
    bar += empty.repeat(
      Math.max(0, 5 - Math.floor(barValue / 2 + maxBarValue % 2))
    );
    return `${label(name)}${bar}${debug ? ` (${value})` : ""}`;
  };
  const label = (str) => {
    return `${str}: `.padEnd(8);
  };
  const remaining = actionTime > 0 ? ` (${duration(actionTime)})` : "";
  const o = (line = "") => {
    output.push(`${line}`);
  };
  o();
  o(`${main.toUpperCase()}${remaining}`);
  o(stat("Happy", happiness));
  o(stat("Hunger", satiety));
  o(stat("Energy", energy));
  o(stat("Health", health));
  o(stat("Toilet", toilet));
  o(label("Age") + duration(age));
  return output.join("\n");
};

// src/critter.ts
var set = (value, smin = 0, smax = max) => {
  return Math.min(smax, Math.max(smin, value));
};
var changeBySchedule = (value, secondsPerCycle, direction) => set(value + max / secondsPerCycle * direction);
var Critter = class {
  action = "idle";
  actionTime = 0;
  age = 0;
  alive = true;
  birth = 0;
  energy = normal;
  error = void 0;
  happiness = normal;
  health = high;
  mood = [];
  poo = false;
  satiety = normal;
  time = this.birth;
  toilet = low;
  constructor({ command }) {
    let state;
    try {
      state = loadState();
    } catch {
      state = {};
    }
    if (command === "new") {
      this.birth = now();
      this.time = this.birth;
    } else {
      this.birth = state?.birth ?? this.birth;
      this.age = state?.age ?? this.age;
      this.satiety = state?.satiety ?? this.satiety;
      this.happiness = state?.happiness ?? this.happiness;
      this.energy = state?.energy ?? this.energy;
      this.toilet = state?.toilet ?? this.toilet;
      this.health = state?.health ?? this.health;
      this.poo = state?.poo ?? this.poo;
      this.actionTime = state?.actionTime ?? this.actionTime;
      this.action = state?.action ?? this.action;
      this.time = state?.time ?? this.time;
      if (!this.birth) {
        this.error = "No Critter";
        return;
      }
    }
    this.process();
    if (command === "feed") {
      this.feed();
    }
    if (command === "clean") {
      this.clean();
    }
    if (command === "medicine") {
      this.medicine();
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
    saveState(this.persistedState());
  }
  clean = () => {
    this.poo = false;
  };
  die = () => {
    this.action = "idle";
    this.actionTime = 0;
    this.alive = false;
    this.mood = ["dead"];
  };
  feed = () => {
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
    if (!this.alive)
      return {
        bottom: "none",
        main: "dead",
        reverse: false,
        sprite: "dead",
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
      sprite: main === "eating" || main === "playing" ? mood : main,
      top: "none"
    };
  };
  medicine = () => {
    this.action = "healing";
    this.actionTime = schedules.health.healingAction;
  };
  persistedState = () => {
    const {
      action,
      actionTime,
      age,
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
      this.die();
      return;
    }
    for (let tick = 0; tick < elapsed; tick += 1) {
      this.age += 1;
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
          schedules.energy.sleeping,
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
        } else if (!this.poo) {
          this.health = changeBySchedule(
            this.health,
            schedules.health.recovery,
            1
          );
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
      }
    }
    this.updateMood();
  };
  refuse = () => {
    this.action = "refusing";
    this.actionTime = 30;
    this.happiness = set(this.happiness - happinessPenalty);
  };
  sleep = () => {
    if (this.energy >= normal) {
      this.refuse();
      return;
    }
    this.action = "sleeping";
    this.actionTime = schedules.energy.sleeping;
  };
  stop = () => {
    if (this.action === "eating" || this.action === "sleeping") {
      this.happiness = set(this.happiness - happinessPenalty);
    }
    this.action = "idle";
    this.actionTime = 0;
  };
  updateMood = () => {
    this.mood = [];
    if (this.satiety < low) {
      this.mood.push("hungry");
    }
    if (this.health < low) {
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
  };
};

// src/cli.ts
var help = `
critter - a terminal pet

Usage: critter [options] [command]

With no command, show your critter's current state.

Commands:
    new       Create a new critter, replacing your current pet
    feed      Give it a meal
    clean     Wash it and stop health loss from dirtiness
    medicine  Restore health; it still needs food and cleaning
    play      Cheer it up; playing while tired is less effective
    sleep     Let it rest for two hours
    stop      Stop the current action

Options:
    -h, --help           Show this help and exit
    -n, --no-nerd-fonts  Use Unicode icons instead of Nerd Font icons
    -d, --debug           Show exact stat values

Daily care: about four meals, two sleeps, three plays, and one cleaning.

Examples:
    critter new
    critter
    critter -n feed
    critter -d
`;
var parseArgs = (args) => {
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(`${help}
`);
    process.exit(0);
  }
  const noNerdFonts = args.includes("-n") || args.includes("--no-nerd-fonts");
  const debug = args.includes("-d") || args.includes("--debug");
  const [command] = args.filter(
    (arg) => arg !== "-n" && arg !== "--no-nerd-fonts" && arg !== "-d" && arg !== "--debug"
  );
  if (!command) return { command: void 0, debug, noNerdFonts };
  switch (command) {
    case "clean":
    case "feed":
    case "medicine":
    case "new":
    case "play":
    case "sleep":
    case "stop":
      return { command, debug, noNerdFonts };
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};
var cli = async () => {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}
`
    );
    process.exit(7);
  }
  const { command, debug, noNerdFonts } = args;
  const critter = new Critter({ command });
  if (critter.error) {
    process.stderr.write(`${critter.error}
`);
    process.exit(1);
  } else {
    console.log(`${critter.plain({ debug, noNerdFonts })}
`);
  }
};

// src/index.ts
cli();

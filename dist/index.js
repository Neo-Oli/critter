#!/usr/bin/env node

// src/config.ts
var max = 1e6;
var high = Math.round(max / 4 * 3);
var normal = Math.round(max / 2);
var low = Math.round(max / 4);
var binName = "critter";
var speed = 1;

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

// src/sprites/cleaning.txt
var cleaning_default = "\u2588\u2580\u2580\u2580\u2588\n\u2588  \u2580\u2580\u2580\n\u2588  \u2580 \u2580\n\u2588\u2584 \u2580 \u2580 \u2584 \u2584 \u2584 \u2584\n\u2588\u2584\u2588\u2584\u2588\u2584\u2588\u2584\u2588\u2584\u2588\u2584\u2588\u2584\u2588\u2584\n\u2588              \u2588\n\u2588              \u2588\n \u2580\u2588\u2588\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2588\u2588\u2580\n";

// src/sprites/dead.txt
var dead_default = "  \u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n\u2584\u2580        \u2584\u2584\u2584 \u2580\u2584\n\u2588 \u2580\u2580\u2580\u2580   \u2588\u2580\u2588\u2580\u2588 \u2588\n\u2588 \u2580\u2580\u2580\u2580   \u2580\u2588\u2588\u2588\u2580 \u2588\n\u2588 \u2580\u2580\u2580\u2580    \u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588 \u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584  \u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588\n";

// src/sprites/dirty.txt
var dirty_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588   \u2588 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588 \u2584 \u2584 \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588   \u2580 \u2588\n \u2588 \u2584 \u2584  \u2584 \u2580 \u2580 \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/eating.txt
var eating_default = "\n\n    \u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2584\n  \u2584\u2580  \u2580     \u2580\u2584\n  \u2588 \u2584\u2584   \u2584   \u2588\n \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\n  \u2588    \u2580  \u2580\u2580 \u2588\n\u2580\u2584\u2584\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2584\u2584\u2580\n";

// src/sprites/happy.txt
var happy_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2580   \u2580 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584\u2584\u2580 \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/healing.txt
var healing_default = "            \u2580\u2584\n        \u2580\u2584  \u2584\u2580\u2580\u2584\n       \u2584\u2580 \u2580\u2588\n     \u2584\u2580    \u2584\u2580\u2584\n   \u2584\u2588\u2588\u2588\u2584 \u2584\u2580\n   \u2588\u2588\u2588\u2588\u2588\u2580\n  \u2584\u2580\u2580\u2580\u2580\n\u2584\u2580\n";

// src/sprites/hungry.txt
var hungry_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588  \u2584 \u2584  \u2588\n\u2588  \u2584\u2584\u2584  \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588  \u2580\u2580\u2588  \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/idle.txt
var idle_default = "\u2588\u2580\u2588\u2584\u2584\u2584\u2588\u2580\u2588\n\u2588       \u2588\n\u2588 \u2588   \u2588 \u2588\u2584\u2584\u2584\u2584\u2584\u2584\n\u2588   \u2584   \u2588     \u2588\u2588\n\u2588\u2584\u2584\u2584\u2584\u2584\u2584\u2584\u2588     \u2588\n \u2588            \u2588\n \u2588  \u2588\u2580\u2588  \u2588\u2580\u2580\u2588 \u2588\n \u2588\u2584\u2584\u2588 \u2588\u2584\u2584\u2588  \u2588\u2584\u2588\n";

// src/sprites/playing.txt
var playing_default = "\n\n\n\n        \u2584\u2588\u2584\n \u2584\u2580\u2580\u2584  \u2588  \u2588\u2584\u2584\u2584\u2584\u2584\n\u2588    \u2588 \u2580\u2580\u2580\u2588   \u2588\n \u2580\u2584\u2584\u2580     \u2588\u2580\u2580\u2580\u2588\n";

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

// src/utils.ts
var now = () => Math.round(Date.now() / 1e3);
var minute = 60;
var hour = minute * 60;
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

// src/plain.ts
var spriteWidth = 16;
var loadSprite = (name) => {
  const sprites = {
    cleaning: cleaning_default,
    dead: dead_default,
    dirty: dirty_default,
    eating: eating_default,
    happy: happy_default,
    healing: healing_default,
    hungry: hungry_default,
    idle: idle_default,
    playing: playing_default,
    refusing: refusing_default,
    sad: sad_default,
    sick: sick_default,
    sleeping: sleeping_default,
    tired: tired_default
  };
  return sprites[name].split(/\r?\n/);
};
var plain = ({
  actionTime,
  age,
  cleanliness,
  energy,
  happiness,
  health,
  noNerdFonts,
  satiety,
  state
}) => {
  const output = loadSprite(state).map((line) => line.padEnd(spriteWidth + 2));
  const stat = (name, value, overflow) => {
    const barValue = Math.round(value / overflow * 10);
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
    if (value > overflow) {
      bar += "!";
    }
    return `${label(name)}${bar}`;
  };
  const label = (str) => {
    return `${str}: `.padEnd(8);
  };
  let i = 0;
  const remaining = actionTime > 0 ? ` (${duration(actionTime)})` : "";
  output[i++] += `${state.toUpperCase()}${remaining}`;
  output[i++] += stat("Happy", happiness, max);
  output[i++] += stat("Hunger", satiety, max);
  output[i++] += stat("Energy", energy, max);
  output[i++] += stat("Health", health, max);
  output[i++] += stat("Clean", cleanliness, max);
  output[i++] += label("Age") + duration(age);
  return output.join("\n");
};

// src/critter.ts
var set = (value, smin = 0, smax = max) => {
  return Math.min(smax, Math.max(smin, value));
};
var Critter = class {
  action = "idle";
  actionTime = 0;
  age = 0;
  alive = true;
  birth = 0;
  cleanliness = low;
  energy = normal;
  error = void 0;
  happiness = max;
  health = high;
  mood = [];
  satiety = normal;
  time = this.birth;
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
      this.cleanliness = state?.cleanliness ?? this.cleanliness;
      this.health = state?.health ?? this.health;
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
    this.action = "cleaning";
    this.actionTime = 60;
  };
  die = () => {
    this.action = "idle";
    this.actionTime = 0;
    this.alive = false;
    this.mood = ["dead"];
  };
  feed = () => {
    if (this.satiety >= max) {
      this.refuse();
      return;
    }
    this.action = "eating";
    this.actionTime = this.satiety < low ? Math.floor((high - this.satiety) / 6250) : minute;
  };
  refuse = () => {
    this.action = "refusing";
    this.actionTime = 30;
    this.happiness = set(this.happiness - 1e3);
  };
  getCritterState = () => {
    if (!this.alive) return "dead";
    const moodPriority = [
      "dead",
      "sick",
      "tired",
      "hungry",
      "dirty",
      "sad",
      "happy"
    ];
    if (this.action !== "idle") return this.action;
    const mood = moodPriority.find(
      (priority) => this.mood.includes(priority)
    );
    return mood ?? "idle";
  };
  medicine = () => {
    this.action = "healing";
    this.actionTime = 10;
  };
  persistedState = () => {
    const {
      action,
      actionTime,
      age,
      birth,
      cleanliness,
      energy,
      happiness,
      health,
      satiety
    } = this;
    return {
      action,
      actionTime,
      age,
      birth,
      cleanliness,
      energy,
      happiness,
      health,
      satiety,
      time: now()
    };
  };
  plain = ({ noNerdFonts }) => plain({
    actionTime: this.actionTime,
    age: this.age,
    cleanliness: this.cleanliness,
    energy: this.energy,
    happiness: this.happiness,
    health: this.health,
    noNerdFonts,
    satiety: this.satiety,
    state: this.getCritterState()
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
      this.mood = [];
      if (this.actionTime <= 0) this.action = "idle";
      if (this.action === "eating") {
        this.satiety = set(this.satiety + 6250);
        if (this.satiety === max) this.refuse();
      } else {
        this.satiety = set(this.satiety - 23);
      }
      if (this.action === "sleeping") {
        this.energy = set(this.energy + 139);
      } else {
        this.energy = set(this.energy - 21);
      }
      if (this.action === "cleaning") {
        this.cleanliness = set(this.cleanliness + 16667);
      } else {
        this.cleanliness = set(this.cleanliness - 9);
      }
      if (this.action === "healing") {
        this.health = set(this.health + 1e5);
      } else if (this.satiety > 0 && this.cleanliness >= low) {
        this.health = set(this.health + 30);
      }
      if (this.action === "playing") {
        this.happiness = set(
          this.happiness + (this.energy < low ? 4167 : 8333)
        );
      } else {
        this.happiness = set(this.happiness - 26);
      }
      this.actionTime = set(this.actionTime - 1, 0, Infinity);
      if (this.actionTime === 0) this.action = "idle";
      if (this.satiety === 0) {
        this.health = set(this.health - (this.health > low ? 14 : 3));
      } else if (this.cleanliness < low) {
        this.health = set(this.health - 2);
      }
      if (this.health === 0) {
        this.die();
        return;
      }
      if (this.satiety < low) {
        this.mood.push("hungry");
      }
      if (this.health < low) {
        this.mood.push("sick");
      }
      if (this.energy === 0 && this.action !== "sleeping") {
        this.sleep();
      }
      if (this.energy < low) {
        this.mood.push("tired");
      }
      if (this.happiness > high) {
        this.mood.push("happy");
      } else if (this.happiness < low) {
        this.mood.push("sad");
      }
      if (this.cleanliness < low) {
        this.mood.push("dirty");
      }
    }
  };
  sleep = () => {
    this.action = "sleeping";
    this.actionTime = 2 * hour;
  };
  stop = () => {
    if (this.action === "eating" || this.action === "sleeping") {
      this.happiness = set(this.happiness - 1e3);
    }
    this.action = "idle";
    this.actionTime = 0;
  };
};

// src/cli.ts
var help = `
critter - a terminal pet

Usage: critter [options] [command]

With no command, show your critter's current state.

Commands:
    new       Create a new critter, replacing your current pet
    feed      Give it a meal; a full critter refuses for 30 seconds
    clean     Wash it and stop health loss from dirtiness
    medicine  Restore health; it still needs food and cleaning
    play      Cheer it up; playing while tired is less effective
    sleep     Let it rest for two hours
    stop      Stop the current action

Options:
    -h, --help           Show this help and exit
    -n, --no-nerd-fonts  Use Unicode icons instead of Nerd Font icons

Daily care: about four meals, two sleeps, three plays, and one cleaning.

Examples:
    critter new
    critter
    critter -n feed
`;
var parseArgs = (args) => {
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(`${help}
`);
    process.exit(0);
  }
  const noNerdFonts = args.includes("-n") || args.includes("--no-nerd-fonts");
  const [command] = args.filter(
    (arg) => arg !== "-n" && arg !== "--no-nerd-fonts"
  );
  if (!command) return { command: void 0, noNerdFonts };
  switch (command) {
    case "clean":
    case "feed":
    case "medicine":
    case "new":
    case "play":
    case "sleep":
    case "stop":
      return { command, noNerdFonts };
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
  const { command, noNerdFonts } = args;
  const critter = new Critter({ command });
  if (critter.error) {
    process.stderr.write(`${critter.error}
`);
    process.exit(1);
  } else {
    console.log(`${critter.plain({ noNerdFonts })}
`);
  }
};

// src/index.ts
cli();

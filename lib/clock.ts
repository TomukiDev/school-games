/** Difficulty bucket: 1 = easiest (1 pt), 4 = hardest (4 pts). */
export type MinuteCategory = 1 | 2 | 3 | 4;

export const CATEGORY_MINUTES: Record<MinuteCategory, readonly number[]> = {
  1: [0, 30],
  2: [15, 45],
  3: [5, 10, 20, 25],
  4: [35, 40, 50, 55],
};

export type TimeFormat = "12h" | "24h";

export type ClockQuestion = {
  hour24: number;
  minute: number;
  correctLabel: string;
  options: string[];
};

export const QUESTIONS_PER_LEVEL = 10;
export const PASS_THRESHOLD = 6;
export const FEEDBACK_MS = 1800;

/** Per-question countdown: numeric seconds at level 1, or no time limit. */
export type ClockTimerPreset = "unlimited" | 10 | 15 | 20;

export const DEFAULT_CLOCK_TIMER_PRESET: ClockTimerPreset = 20;

const MIN_SECONDS_PER_QUESTION = 4;

export function getSecondsForLevel(level: number, preset: ClockTimerPreset): number {
  if (preset === "unlimited") {
    return Number.POSITIVE_INFINITY;
  }
  const seconds = preset - (level - 1);
  return Math.max(MIN_SECONDS_PER_QUESTION, seconds);
}

export function parseTimerPresetParam(param: string | null): ClockTimerPreset | null {
  if (!param || !param.trim()) return null;
  const s = param.trim();
  if (s === "unlimited") return "unlimited";
  if (s === "10" || s === "15" || s === "20") {
    return Number(s) as 10 | 15 | 20;
  }
  return null;
}

/** Points for a correct answer based on minute value (per game rules). */
export function getPointsForMinute(minute: number): number {
  for (const cat of [1, 2, 3, 4] as const) {
    if (CATEGORY_MINUTES[cat].includes(minute)) {
      return cat;
    }
  }
  return 1;
}

/**
 * Unlocks categories from easiest to hardest as level increases.
 * Level 1 → first selected category only; level N → first N selected (capped by how many were chosen).
 */
export function getUnlockedCategories(level: number, selected: MinuteCategory[]): MinuteCategory[] {
  const sorted = [...new Set(selected)].sort((a, b) => a - b);
  const n = Math.min(Math.max(level, 1), sorted.length);
  return sorted.slice(0, n);
}

export function getAllowedMinutesForCategories(categories: MinuteCategory[]): number[] {
  const set = new Set<number>();
  for (const c of categories) {
    for (const m of CATEGORY_MINUTES[c]) {
      set.add(m);
    }
  }
  return [...set].sort((a, b) => a - b);
}

export function formatTimeLabel(hour24: number, minute: number, format: TimeFormat): string {
  const m = String(minute).padStart(2, "0");
  if (format === "24h") {
    return `${String(hour24).padStart(2, "0")}:${m}`;
  }
  const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${h12}:${m}`;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Builds a quiz question: random time using only minutes allowed by unlocked categories,
 * three distinct text options (same format).
 */
export function generateClockQuestion(
  selectedCategories: MinuteCategory[],
  level: number,
  format: TimeFormat,
): ClockQuestion {
  const unlocked = getUnlockedCategories(level, selectedCategories);
  const allowedMinutes = getAllowedMinutesForCategories(unlocked);
  if (allowedMinutes.length === 0) {
    throw new Error("generateClockQuestion: no allowed minutes");
  }

  const minute = allowedMinutes[randomInt(0, allowedMinutes.length - 1)];
  /** In 12h mode use 1–12 only so lancette + etichetta coincidono senza AM/PM. */
  const hour24 =
    format === "12h" ? randomInt(1, 12) : randomInt(0, 23);
  const correctLabel = formatTimeLabel(hour24, minute, format);

  const wrongLabels = new Set<string>();
  const hourRange = format === "12h" ? { min: 1, max: 12 } : { min: 0, max: 23 };
  let guard = 0;
  while (wrongLabels.size < 2 && guard < 200) {
    guard++;
    const m = allowedMinutes[randomInt(0, allowedMinutes.length - 1)];
    const h = randomInt(hourRange.min, hourRange.max);
    const label = formatTimeLabel(h, m, format);
    if (label !== correctLabel) {
      wrongLabels.add(label);
    }
  }

  while (wrongLabels.size < 2) {
    const h = randomInt(hourRange.min, hourRange.max);
    const label = formatTimeLabel(h, minute, format);
    if (label !== correctLabel) wrongLabels.add(label);
  }

  const options = shuffle([correctLabel, ...Array.from(wrongLabels).slice(0, 2)]);
  return {
    hour24,
    minute,
    correctLabel,
    options,
  };
}

export function parseCategoriesParam(param: string | null): MinuteCategory[] | null {
  if (!param || !param.trim()) return null;
  const parts = param
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => n === 1 || n === 2 || n === 3 || n === 4);
  return parts.length > 0 ? (parts as MinuteCategory[]) : null;
}

export function parseFormatParam(param: string | null): TimeFormat | null {
  if (param === "12h" || param === "24h") return param;
  return null;
}

export function isClockTimerPreset(value: unknown): value is ClockTimerPreset {
  return value === "unlimited" || value === 10 || value === 15 || value === 20;
}

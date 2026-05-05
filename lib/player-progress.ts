export type PlayerProgressRow = {
  user_id: string;
  xp: number;
  level: number;
  current_streak_days: number;
  last_play_date: string | null;
  updated_at?: string;
};

const XP_BASE_PER_SESSION = 8;
const XP_PASS_BONUS = 6;
const XP_PERSONAL_BEST_BONUS = 10;
const XP_LOSS_FLOOR = 3;

export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 20)) + 1;
}

export function xpToNextLevel(currentXp: number): number {
  const currentLevel = levelFromXp(currentXp);
  const targetXp = Math.pow(currentLevel, 2) * 20;
  return Math.max(targetXp - currentXp, 0);
}

export function computeSessionXp(params: { passed: boolean; newPersonalBest: boolean }): number {
  if (!params.passed) return XP_LOSS_FLOOR;
  return XP_BASE_PER_SESSION + XP_PASS_BONUS + (params.newPersonalBest ? XP_PERSONAL_BEST_BONUS : 0);
}

export function computeNextStreak(
  lastPlayDateIso: string | null,
  currentStreak: number,
  today: Date,
): number {
  if (!lastPlayDateIso) return 1;
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const last = new Date(lastPlayDateIso);
  const lastUtc = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
  const diffDays = Math.round((todayUtc.getTime() - lastUtc.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return currentStreak || 1;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

"use client";

import { type AppGameId, saveRankingIfBest } from "@/lib/game-ranking";
import { createClient } from "@/lib/supabase/client";
import {
  ACHIEVEMENTS,
  pickAchievementIds,
  type SessionStats,
} from "@/lib/achievements";
import {
  computeNextStreak,
  computeSessionXp,
  levelFromXp,
  xpToNextLevel,
  type PlayerProgressRow,
} from "@/lib/player-progress";
import { pickCosmeticUnlockIds } from "@/lib/cosmetics";

type FinalizeInput = {
  gameId: AppGameId;
  passed: boolean;
  level: number;
  points: number;
  stats?: SessionStats;
};

export type SessionSummaryData = {
  newPersonalBest: boolean;
  xpGained: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  streakDays: number;
  xpToNextLevel: number;
  unlockedAchievements: Array<{ id: string; title: string; description: string }>;
};

const EMPTY_SUMMARY: SessionSummaryData = {
  newPersonalBest: false,
  xpGained: 0,
  totalXp: 0,
  level: 1,
  leveledUp: false,
  streakDays: 1,
  xpToNextLevel: 20,
  unlockedAchievements: [],
};

export async function finalizeGameSession(input: FinalizeInput): Promise<SessionSummaryData> {
  const supabase = createClient();
  const rankingRes = await saveRankingIfBest(input.gameId, input.level, input.points);
  const newPersonalBest = rankingRes.updated;
  const xpGained = computeSessionXp({ passed: input.passed, newPersonalBest });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ...EMPTY_SUMMARY, newPersonalBest, xpGained };

  const { data: currentProgress } = await supabase
    .from("player_progress")
    .select("user_id, xp, level, current_streak_days, last_play_date")
    .eq("user_id", user.id)
    .maybeSingle<PlayerProgressRow>();

  const baseXp = currentProgress?.xp ?? 0;
  const totalXp = baseXp + xpGained;
  const previousLevel = currentProgress?.level ?? 1;
  const currentStreak = currentProgress?.current_streak_days ?? 0;
  const today = new Date();
  const nextStreak = computeNextStreak(currentProgress?.last_play_date ?? null, currentStreak, today);
  const nextLevel = levelFromXp(totalXp);
  const leveledUp = nextLevel > previousLevel;
  const dateISO = today.toISOString().slice(0, 10);

  await supabase.from("player_progress").upsert(
    {
      user_id: user.id,
      xp: totalXp,
      level: nextLevel,
      current_streak_days: nextStreak,
      last_play_date: dateISO,
      updated_at: today.toISOString(),
    },
    { onConflict: "user_id" },
  );

  const toUnlockIds = pickAchievementIds({
    gameId: input.gameId,
    newPersonalBest,
    streakDays: nextStreak,
    stats: input.stats,
  });

  if (toUnlockIds.length > 0) {
    await supabase.from("user_achievements").upsert(
      toUnlockIds.map((achievementId) => ({
        user_id: user.id,
        achievement_id: achievementId,
        unlocked_at: today.toISOString(),
      })),
      { onConflict: "user_id,achievement_id", ignoreDuplicates: true },
    );
  }

  const cosmeticIds = pickCosmeticUnlockIds({
    level: nextLevel,
    unlockedAchievementIds: toUnlockIds,
  });
  if (cosmeticIds.length > 0) {
    await supabase.from("user_cosmetics").upsert(
      cosmeticIds.map((cosmeticId) => ({
        user_id: user.id,
        cosmetic_id: cosmeticId,
        unlocked_at: today.toISOString(),
      })),
      { onConflict: "user_id,cosmetic_id", ignoreDuplicates: true },
    );
  }

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => toUnlockIds.includes(a.id)).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
  }));

  return {
    newPersonalBest,
    xpGained,
    totalXp,
    level: nextLevel,
    leveledUp,
    streakDays: nextStreak,
    xpToNextLevel: xpToNextLevel(totalXp),
    unlockedAchievements,
  };
}

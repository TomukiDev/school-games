import { createClient } from "@/lib/supabase/client";

/** UUID in `public.app` — devono coincidere con le migration Supabase. */
export const APP_GAME_IDS = {
  tabelline: "6b2a68b9-82a5-4168-88e2-a8f67a40dd56",
  orologio: "7c9e4b2a-1d3f-4e8c-9a5b-2f6e8d1c4a90",
} as const;

export type AppGameId = (typeof APP_GAME_IDS)[keyof typeof APP_GAME_IDS];

/**
 * Se i punti totali (sessione) superano il record salvato, aggiorna livello e punti.
 * In parità di punti, tiene il livello più alto.
 */
export async function saveRankingIfBest(
  gameId: AppGameId,
  completedLevel: number,
  totalPoints: number,
): Promise<{ updated: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { updated: false, error: "non autenticato" };
  }

  const { data: row, error: selError } = await supabase
    .from("ranking")
    .select("level, points")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle();

  if (selError) {
    return { updated: false, error: selError.message };
  }

  const bestPoints = row?.points ?? -1;
  const bestLevel = row?.level ?? 0;
  const isBetter =
    totalPoints > bestPoints || (totalPoints === bestPoints && completedLevel > bestLevel);

  if (!isBetter) {
    return { updated: false };
  }

  const payload = {
    user_id: user.id,
    game_id: gameId,
    level: completedLevel,
    points: totalPoints,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("ranking").upsert(payload, {
    onConflict: "user_id,game_id",
  });

  if (upsertError) {
    return { updated: false, error: upsertError.message };
  }

  return { updated: true };
}

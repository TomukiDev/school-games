import { redirect } from "next/navigation";
import HubMenuButton from "@/components/HubMenuButton";
import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENTS } from "@/lib/achievements";

type UserAchievementRow = {
  achievement_id: string;
  unlocked_at: string;
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id);

  const unlockedMap = new Map((unlocked ?? []).map((item: UserAchievementRow) => [item.achievement_id, item]));

  return (
    <div className="min-h-screen bg-gradient-to-b from-kid-sun/20 via-background to-kid-mint/20">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <HubMenuButton />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl">Le tue medaglie</h1>
          <span className="w-16 shrink-0 sm:w-20" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <p className="mx-auto max-w-xl text-center text-base text-zinc-600 dark:text-zinc-300">
          Ogni sfida completata ti avvicina a nuove medaglie. Torna ogni giorno per fare progressi.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlock = unlockedMap.get(achievement.id);
            return (
              <li
                key={achievement.id}
                className={`rounded-2xl border p-4 shadow-sm transition sm:p-5 ${
                  unlock
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                    : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/70"
                }`}
              >
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{achievement.title}</h2>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{achievement.description}</p>
                <p className="mt-3 text-sm font-semibold">
                  {unlock ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Sbloccata!</span>
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400">Da sbloccare</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

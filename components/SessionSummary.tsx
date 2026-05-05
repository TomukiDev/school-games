import PlayfulMascot from "@/components/PlayfulMascot";
import type { SessionSummaryData } from "@/lib/finalize-game-session";

type Props = {
  mode: "levelEnd" | "retry";
  summary: SessionSummaryData | null;
  correctCount: number;
  totalQuestions: number;
};

export default function SessionSummary({ mode, summary, correctCount, totalQuestions }: Props) {
  const title = mode === "levelEnd" ? "Round completato!" : "Round da riprovare";
  const mood = mode === "levelEnd" ? "celebrate" : "encourage";

  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-zinc-200 bg-white/90 p-5 text-center shadow-md dark:border-zinc-700 dark:bg-zinc-900/90 sm:p-6">
      <div className="flex justify-center">
        <PlayfulMascot mood={mood} />
      </div>
      <h3 className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        Risposte giuste: {correctCount}/{totalQuestions}
      </p>

      {summary && (
        <div className="mt-4 space-y-2 rounded-2xl bg-zinc-100/80 p-3 text-left dark:bg-zinc-800/70">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            +{summary.xpGained} XP • Livello {summary.level} • Streak {summary.streakDays} giorni
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Ti mancano {summary.xpToNextLevel} XP al prossimo livello.
          </p>
          {summary.newPersonalBest && (
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Nuovo record personale!</p>
          )}
          {summary.unlockedAchievements.length > 0 && (
            <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
              {summary.unlockedAchievements.slice(0, 2).map((a) => (
                <li key={a.id}>Medaglia sbloccata: {a.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

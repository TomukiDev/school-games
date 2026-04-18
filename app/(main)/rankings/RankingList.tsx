type AppRow = {
  id: string;
  name: string | null;
};

export type RankingRow = {
  game_id: string;
  level: number;
  points: number;
  updated_at: string | null;
};

type Props = {
  games: AppRow[];
  rankings: RankingRow[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function RankingList({ games, rankings }: Props) {
  const byGame = new Map(rankings.map((r) => [r.game_id, r]));

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-1">
      {games.map((g) => {
        const r = byGame.get(g.id);
        return (
          <li
            key={g.id}
            className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{g.name ?? "Gioco"}</h2>
            {r ? (
              <dl className="mt-3 grid gap-2 text-base text-zinc-700 dark:text-zinc-300 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Miglior livello
                  </dt>
                  <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{r.level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Miglior punteggio
                  </dt>
                  <dd className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{r.points}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Aggiornato
                  </dt>
                  <dd className="text-base text-zinc-800 dark:text-zinc-200">{formatDate(r.updated_at)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
                Non hai ancora registrato un punteggio per questo gioco.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

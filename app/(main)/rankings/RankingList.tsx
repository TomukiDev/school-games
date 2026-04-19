import Image from "next/image";

type AppRow = {
  id: string;
  name: string | null;
  icon: string | null;
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
        const title = g.name ?? "Gioco";
        return (
          <li
            key={g.id}
            className="rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="shrink-0">
                {g.icon ? (
                  <Image
                    src={g.icon}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                  />
                ) : (
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200 text-lg font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 sm:h-16 sm:w-16"
                    aria-hidden
                  >
                    {title.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-center text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                  {title}
                </h2>
                {r ? (
                  <dl className="mt-3 grid gap-3 text-base text-zinc-700 dark:text-zinc-300 sm:grid-cols-3 sm:gap-2">
                    <div>
                      <dt className="text-center text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Miglior punteggio
                      </dt>
                      <dd className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">{r.points}</dd>
                    </div>
                    <div>
                      <dt className="text-center text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Livello
                      </dt>
                      <dd className="text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">{r.level}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-center text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Data del record...
                      </dt>
                      <dd className="text-center text-base text-zinc-800 dark:text-zinc-200">{formatDate(r.updated_at)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
                    Non hai ancora registrato un punteggio per questo gioco.
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

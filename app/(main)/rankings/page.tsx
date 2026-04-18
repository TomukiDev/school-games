import { redirect } from "next/navigation";
import HubMenuButton from "@/components/HubMenuButton";
import { createClient } from "@/lib/supabase/server";
import RankingList from "./RankingList";

export default async function RankingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: games, error: appsError } = await supabase.from("app").select("id, name").order("priority");

  const { data: rankings, error: rankError } = await supabase
    .from("ranking")
    .select("game_id, level, points, updated_at")
    .eq("user_id", user.id);

  if (appsError) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
        <p className="text-center text-red-600">Impossibile caricare i giochi: {appsError.message}</p>
      </div>
    );
  }

  if (rankError) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
        <p className="text-center text-red-600">Impossibile caricare i punteggi: {rankError.message}</p>
      </div>
    );
  }

  const list = games ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <HubMenuButton />
          <h1 className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl">
            I tuoi punteggi
          </h1>
          <span className="w-16 shrink-0 sm:w-20" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <p className="mx-auto max-w-lg text-center text-base text-zinc-600 dark:text-zinc-400">
          Per ogni gioco vedi il miglior risultato che hai ottenuto al termine di un livello (livello raggiunto e
          punti totali cumulativi in quella sessione).
        </p>
        {list.length === 0 ? (
          <p className="mt-10 text-center text-zinc-600 dark:text-zinc-400">
            Inizia a giocare per accumulare punti, poi torna qui per vedere i tuoi migliori risultati!
          </p>
        ) : (
          <RankingList games={list} rankings={rankings ?? []} />
        )}
      </main>
    </div>
  );
}

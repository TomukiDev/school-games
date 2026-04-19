import Image from "next/image";
import Link from "next/link";
import HubHeaderActions from "./HubHeaderActions";
import { GAMES } from "@/lib/games";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HubPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) {
    console.error(error);
    return <div>Error loading user profile</div>;
  }
  const profile = data;
  if (!profile) {
    return <div>User profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <header className="sticky top-0 z-10 flex items-center justify-end border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <HubHeaderActions />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <h1 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Ciao {profile.full_name ?? "giocatore"}, scegli un gioco
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          Tocca un&apos;icona per iniziare. Altri giochi arriveranno presto.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-5">
          {GAMES.map((game) => (
            <li key={game.id}>
              <Link
                href={game.href}
                className="flex aspect-square min-h-[120px] flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-200/90 bg-white p-4 text-center shadow-md transition active:scale-[0.98] hover:border-sky-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-sky-700"
              >
                <Image
                  src={game.imageSrc}
                  alt={game.imageAlt}
                  width={80}
                  height={80}
                  unoptimized
                  className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
                />
                <span className="text-base font-semibold text-zinc-800 sm:text-lg dark:text-zinc-100">
                  {game.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

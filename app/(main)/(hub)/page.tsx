import HubHeaderActions from "./HubHeaderActions";
import GameTileLink from "@/components/GameTileLink";
import PlayfulMascot from "@/components/PlayfulMascot";
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
    <div className="min-h-screen bg-gradient-to-b from-kid-sun/25 via-background to-kid-mint/20 dark:from-kid-sun/10 dark:via-background dark:to-kid-mint/10">
      <header className="sticky top-0 z-10 flex items-center justify-end border-b border-[var(--kid-header-border)] bg-kid-surface/90 px-4 py-3 backdrop-blur-md dark:bg-kid-surface/85">
        <HubHeaderActions />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <div className="flex flex-col items-center gap-3">
          <PlayfulMascot />
          <h1 className="text-center font-display text-2xl font-extrabold tracking-tight text-kid-ink sm:text-4xl">
            Ciao {profile.full_name ?? "giocatore"}, scegli un gioco
          </h1>
        </div>
        <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-kid-ink-muted sm:mt-4 sm:text-lg">
          Tocca un&apos;icona per iniziare. Altri giochi arriveranno presto.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-5">
          {GAMES.map((game) => (
            <li key={game.id}>
              <GameTileLink
                href={game.href}
                title={game.title}
                imageSrc={game.imageSrc}
                imageAlt={game.imageAlt}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

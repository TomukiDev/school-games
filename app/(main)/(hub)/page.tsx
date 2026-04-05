import Image from "next/image";
import Link from "next/link";
import { GAMES } from "@/lib/games";

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M18.685 19.097A8.001 8.001 0 0 0 6.343 3.031 8 8 0 0 0 5.207 18.77a10.94 10.94 0 0 1 6.586-2.166c2.493 0 4.774.83 6.892 2.223zm-6.892 2.903c-3.74 0-6.876 2.55-7.775 6h15.55c-.899-3.45-4.035-6-7.775-6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function HubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <header className="sticky top-0 z-10 flex items-center justify-end border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
        <Link
          href="/profile"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Apri profilo"
        >
          <ProfileIcon />
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <h1 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Scegli un gioco
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
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
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{game.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

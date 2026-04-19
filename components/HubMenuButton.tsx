import Link from "next/link";

/** Shared style for hub header actions (Menu, game setup toggles, etc.). */
export const hubHeaderButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-kid-sky/40 bg-kid-surface px-3 py-2 text-base font-semibold text-kid-ink shadow-md shadow-kid-sky/10 transition duration-200 hover:-translate-y-0.5 hover:border-kid-sky hover:bg-kid-cloud active:scale-[0.98] dark:border-kid-sky/35 dark:bg-kid-surface dark:text-kid-ink dark:hover:bg-kid-cloud/50";

function GridMenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return <rect key={i} x={3 + col * 7} y={3 + row * 7} width="5" height="5" rx="1" />;
      })}
    </svg>
  );
}

export default function HubMenuButton() {
  return (
    <Link href="/" className={hubHeaderButtonClass} aria-label="Torna al menu dei giochi">
      <GridMenuIcon />
      <span>Menu</span>
    </Link>
  );
}

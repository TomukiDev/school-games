import Link from "next/link";

const buttonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

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
    <Link href="/" className={buttonClass} aria-label="Torna al menu dei giochi">
      <GridMenuIcon />
      <span>Menu</span>
    </Link>
  );
}

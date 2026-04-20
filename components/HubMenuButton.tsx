import Link from "next/link";

/** Shared style for hub header actions (Menu, game setup toggles, etc.). */
export const hubHeaderButtonClass =
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

/** Matches hub header text color in light/dark (`hubHeaderButtonClass`). */
const hubHeaderIconClass = "h-5 w-5 shrink-0";

/** Wrench — uses `currentColor` (same pattern as `GridMenuIcon`). */
export function HubWrenchIcon({ className = hubHeaderIconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.306 28.306" fill="currentColor" className={className} aria-hidden>
      <path d="M12.486,8.162c0.598-2.139,0.055-4.53-1.623-6.213C9.189,0.283,6.824-0.263,4.699,0.314l3.602,3.603L7.355,7.443L3.824,8.387l-3.604-3.6c-0.574,2.127-0.027,4.49,1.645,6.162c1.748,1.751,4.271,2.266,6.477,1.547l0.021,0.02l14.818,14.818c0.586,0.585,1.355,0.881,2.123,0.881c0.77,0,1.535-0.296,2.123-0.881c1.172-1.17,1.172-3.069,0-4.246L12.486,8.162z M25.562,26.831c-0.631,0-1.141-0.513-1.141-1.147s0.51-1.146,1.141-1.146c0.637,0,1.152,0.512,1.152,1.146S26.199,26.831,25.562,26.831z" />
    </svg>
  );
}

/** Clock in circle — uses `currentColor`. */
export function HubClockCircleIcon({ className = hubHeaderIconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237.54 237.54" fill="currentColor" className={className} aria-hidden>
      <path d="M118.77,0c32.8,0,62.49,13.29,83.98,34.79c21.49,21.49,34.79,51.19,34.79,83.98s-13.29,62.49-34.79,83.98 c-21.49,21.49-51.19,34.79-83.98,34.79c-32.8,0-62.49-13.29-83.98-34.79C13.29,181.26,0,151.56,0,118.77s13.29-62.49,34.79-83.98 C56.28,13.29,85.97,0,118.77,0L118.77,0z M109.06,60.2c0-3.59,2.91-6.5,6.5-6.5s6.5,2.91,6.5,6.5v60l45.14,26.76 c3.08,1.82,4.11,5.8,2.29,8.89c-1.82,3.08-5.8,4.11-8.89,2.29l-47.99-28.45c-2.11-1.08-3.55-3.27-3.55-5.79V60.2L109.06,60.2z M193.56,43.98C174.42,24.84,147.98,13,118.77,13c-29.21,0-55.65,11.84-74.79,30.98C24.84,63.12,13,89.56,13,118.77 c0,29.21,11.84,55.65,30.98,74.79c19.14,19.14,45.58,30.98,74.79,30.98c29.21,0,55.65-11.84,74.79-30.98 c19.14-19.14,30.98-45.58,30.98-74.79C224.54,89.56,212.7,63.12,193.56,43.98L193.56,43.98z" />
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

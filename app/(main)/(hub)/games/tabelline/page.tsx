"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import HubMenuButton from "@/components/HubMenuButton";

const startButtonClass =
  "min-h-12 w-full max-w-md rounded-full px-8 py-3 text-base font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11";

export default function TabellineSetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const allTables = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = window.localStorage.getItem("tables:selected");
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n))) {
          setSelected(parsed.filter((n) => n >= 1 && n <= 10));
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function toggleTable(table: number): void {
    setSelected((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table].sort((a, b) => a - b),
    );
  }

  function toggleAll(): void {
    setSelected((prev) => (prev.length === 10 ? [] : allTables));
  }

  function startGame(): void {
    if (selected.length === 0) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tables:selected", JSON.stringify(selected));
    }
    const params = new URLSearchParams({ tables: selected.join(",") });
    router.push(`/game?${params.toString()}`);
  }

  const canStart = selected.length > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:pb-10 sm:pt-8">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <HubMenuButton />
        </div>

        <h1 className="mt-4 text-center font-display text-2xl font-extrabold tracking-tight text-kid-ink sm:mt-6 sm:text-3xl">
          Impara le Tabelline
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm leading-snug text-kid-ink-muted sm:text-base">
          Scegli su quali tabelline vuoi allenarti.
        </p>

        <div className="mt-5 flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:mt-6">
          <span className="min-w-0 text-sm font-semibold text-kid-ink sm:text-base">Scelta veloce</span>
          <button
            type="button"
            className="shrink-0 rounded-xl border-2 border-kid-sky/40 bg-kid-surface px-4 py-2 text-sm font-semibold text-kid-ink shadow-sm transition hover:border-kid-sky hover:bg-kid-cloud active:scale-[0.98] dark:border-kid-sky/35 dark:bg-kid-surface dark:hover:bg-kid-cloud/50 sm:min-h-11 sm:px-5"
            onClick={toggleAll}
          >
            {selected.length === 10 ? "Niente" : "Tutto"}
          </button>
        </div>

        <ul className="mt-4 grid list-none grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-5 sm:gap-3">
          {allTables.map((t) => (
            <li key={t}>
              <label className="flex min-h-[4.25rem] cursor-pointer items-center gap-3 rounded-2xl border-2 border-zinc-200 bg-white px-3 py-3 transition hover:border-kid-sky/50 hover:bg-kid-cloud/50 active:scale-[0.99] dark:border-zinc-700 dark:bg-kid-surface dark:hover:border-kid-sky/40 sm:min-h-0 sm:flex-col sm:items-center sm:justify-center sm:gap-2 sm:px-2 sm:py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-zinc-400 sm:mt-0 sm:h-4 sm:w-4"
                  checked={selected.includes(t)}
                  onChange={() => toggleTable(t)}
                  aria-label={`Tabellina del ${t}`}
                />
                <span className="min-w-0 flex-1 text-left text-sm font-medium leading-snug text-kid-ink sm:flex-none sm:text-center">
                  <span className="sm:hidden">
                    Tabellina del <span className="text-lg font-extrabold tabular-nums">{t}</span>
                  </span>
                  <span className="hidden flex-col items-center gap-1 sm:flex">
                    <span className="text-xs font-semibold text-kid-ink-muted">Tabellina del</span>
                    <span className="text-2xl font-extrabold tabular-nums">{t}</span>
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden justify-center sm:flex">
          <button
            onClick={startGame}
            disabled={!canStart}
            className={startButtonClass}
            style={{ backgroundColor: !canStart ? "#9ca3af" : "#2563eb" }}
            type="button"
          >
            Inizia
          </button>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
        <div className="mx-auto flex max-w-3xl justify-center pb-[env(safe-area-inset-bottom,0.5rem)] pt-0.5">
          <button
            onClick={startGame}
            disabled={!canStart}
            className={startButtonClass}
            style={{ backgroundColor: !canStart ? "#9ca3af" : "#2563eb" }}
            type="button"
          >
            Inizia
          </button>
        </div>
      </div>
    </div>
  );
}

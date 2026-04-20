"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HubMenuButton, {
  HubClockCircleIcon,
  HubWrenchIcon,
  hubHeaderButtonClass,
} from "@/components/HubMenuButton";
import type { ClockTimerPreset, MinuteCategory, TimeFormat } from "@/lib/clock";
import { CATEGORY_MINUTES, DEFAULT_CLOCK_TIMER_PRESET, isClockTimerPreset } from "@/lib/clock";

const STORAGE_KEY = "clock:setup";

const startButtonClass =
  "min-h-12 w-full max-w-md rounded-full px-8 py-3 text-base font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11";

type StoredSetup = {
  categories: MinuteCategory[];
  format: TimeFormat;
  timerPreset?: ClockTimerPreset;
};

const ALL_CATEGORIES: MinuteCategory[] = [1, 2, 3, 4];

const CATEGORY_INFO: { cat: MinuteCategory; label: string; points: number }[] = [
  { cat: 1, label: "Facile (1 punto)", points: 1 },
  { cat: 2, label: "Medio (2 punti)", points: 2 },
  { cat: 3, label: "Più difficile (3 punti)", points: 3 },
  { cat: 4, label: "Esperti (4 punti)", points: 4 },
];

function formatMinuteList(cat: MinuteCategory): string {
  return CATEGORY_MINUTES[cat].join(", ");
}

export default function OrologioSetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<MinuteCategory[]>([1]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [timerPreset, setTimerPreset] = useState<ClockTimerPreset>(DEFAULT_CLOCK_TIMER_PRESET);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as StoredSetup;
        if (Array.isArray(parsed.categories)) {
          const valid = parsed.categories.filter((n): n is MinuteCategory =>
            n === 1 || n === 2 || n === 3 || n === 4,
          );
          if (valid.length > 0) setSelected(valid.sort((a, b) => a - b));
        }
        if (parsed.format === "12h" || parsed.format === "24h") {
          setTimeFormat(parsed.format);
        }
        if (isClockTimerPreset(parsed.timerPreset)) {
          setTimerPreset(parsed.timerPreset);
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function toggleCategory(cat: MinuteCategory): void {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].sort((a, b) => a - b),
    );
  }

  function toggleAll(): void {
    setSelected((prev) => (prev.length === ALL_CATEGORIES.length ? [1] : [...ALL_CATEGORIES]));
  }

  function startGame(): void {
    if (selected.length === 0) return;
    const setup: StoredSetup = { categories: selected, format: timeFormat, timerPreset };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    }
    const params = new URLSearchParams({
      cats: selected.join(","),
      fmt: timeFormat,
      timer: timerPreset === "unlimited" ? "unlimited" : String(timerPreset),
    });
    router.push(`/clock-game?${params.toString()}`);
  }

  const canStart = selected.length > 0;

  const radioCardClass =
    "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-2 transition hover:border-kid-sky/50 hover:bg-kid-cloud/50 active:scale-[0.99] dark:border-zinc-700 dark:bg-kid-surface dark:hover:border-kid-sky/40 sm:min-h-11";

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:pb-10 sm:pt-8">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <HubMenuButton />
          {!advancedOpen ? (
            <button
              type="button"
              className={hubHeaderButtonClass}
              onClick={() => setAdvancedOpen(true)}
              aria-expanded={false}
              aria-label="Apri impostazioni avanzate"
            >
              <HubWrenchIcon />
              <span>Imposta</span>
            </button>
          ) : (
            <button
              type="button"
              className={hubHeaderButtonClass}
              onClick={() => setAdvancedOpen(false)}
              aria-expanded={true}
              aria-label="Torna a giocare"
            >
              <HubClockCircleIcon />
              <span>Gioca</span>
            </button>
          )}
        </div>

        {!advancedOpen && (
          <>
            <h1 className="mt-4 text-center font-display text-2xl font-extrabold tracking-tight text-kid-ink sm:mt-6 sm:text-3xl">
              Che ora è?
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-snug text-kid-ink-muted sm:text-base">
              Scegli quali minuti possono comparire sull&apos;orologio, poi premi Inizia.
            </p>

            <div className="mt-5 flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:mt-6">
              <span className="min-w-0 text-sm font-semibold text-kid-ink sm:text-base">Categorie di minuti</span>
              <button
                type="button"
                className="shrink-0 rounded-xl border-2 border-kid-sky/40 bg-kid-surface px-4 py-2 text-sm font-semibold text-kid-ink shadow-sm transition hover:border-kid-sky hover:bg-kid-cloud active:scale-[0.98] dark:border-kid-sky/35 dark:bg-kid-surface dark:hover:bg-kid-cloud/50 sm:min-h-11 sm:px-5"
                onClick={toggleAll}
              >
                {selected.length === ALL_CATEGORIES.length ? "Solo la più facile" : "Seleziona tutto"}
              </button>
            </div>

            <ul className="mt-4 grid list-none grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-3">
              {CATEGORY_INFO.map(({ cat, label, points }) => (
                <li key={cat}>
                  <label className="flex min-h-[4.25rem] cursor-pointer flex-col gap-1 rounded-2xl border-2 border-zinc-200 bg-white px-3 py-3 transition hover:border-kid-sky/50 hover:bg-kid-cloud/50 active:scale-[0.99] dark:border-zinc-700 dark:bg-kid-surface dark:hover:border-kid-sky/40 sm:min-h-0 sm:flex-row sm:items-start sm:gap-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-zinc-400"
                        checked={selected.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="text-sm font-semibold text-kid-ink sm:text-base">{label}</span>
                    </div>
                    <span className="pl-6 text-sm text-kid-ink-muted sm:pl-0">
                      Minuti: {formatMinuteList(cat)} ({points} pt)
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
          </>
        )}

        {advancedOpen && (
          <div className="mt-6 flex flex-col gap-5 sm:mt-8" role="region" aria-label="Impostazioni avanzate">
            <h2 className="text-center font-display text-lg font-extrabold tracking-tight text-kid-ink sm:text-xl">
              Impostazioni avanzate
            </h2>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-kid-ink sm:text-base">Formato dell&apos;ora</legend>
              <div className="flex flex-wrap gap-3">
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="fmt"
                    className="h-4 w-4 shrink-0"
                    checked={timeFormat === "12h"}
                    onChange={() => setTimeFormat("12h")}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">12 ore (es. 2:35)</span>
                </label>
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="fmt"
                    className="h-4 w-4 shrink-0"
                    checked={timeFormat === "24h"}
                    onChange={() => setTimeFormat("24h")}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">24 ore (es. 14:35)</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-kid-ink sm:text-base">Tempo per ogni domanda</legend>
              <div className="flex flex-wrap gap-3">
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4 shrink-0"
                    checked={timerPreset === "unlimited"}
                    onChange={() => setTimerPreset("unlimited")}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">Illimitato</span>
                </label>
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4 shrink-0"
                    checked={timerPreset === 20}
                    onChange={() => setTimerPreset(20)}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">20 secondi</span>
                </label>
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4 shrink-0"
                    checked={timerPreset === 15}
                    onChange={() => setTimerPreset(15)}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">15 secondi</span>
                </label>
                <label className={radioCardClass}>
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4 shrink-0"
                    checked={timerPreset === 10}
                    onChange={() => setTimerPreset(10)}
                  />
                  <span className="text-sm text-kid-ink sm:text-base">10 secondi</span>
                </label>
              </div>
            </fieldset>
          </div>
        )}
      </main>

      {!advancedOpen && (
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
      )}
    </div>
  );
}

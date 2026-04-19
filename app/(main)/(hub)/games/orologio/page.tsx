"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HubMenuButton, { hubHeaderButtonClass } from "@/components/HubMenuButton";
import type { ClockTimerPreset, MinuteCategory, TimeFormat } from "@/lib/clock";
import { CATEGORY_MINUTES, DEFAULT_CLOCK_TIMER_PRESET, isClockTimerPreset } from "@/lib/clock";

const STORAGE_KEY = "clock:setup";

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

/** Same visual size as `GridMenuIcon` in HubMenuButton (`h-5 w-5`). */
const headerIconImgClass = "h-5 w-5 shrink-0 object-contain";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 font-sans dark:bg-black sm:py-16">
      <main className="flex w-full max-w-3xl flex-col gap-6 rounded-xl bg-white px-4 py-8 shadow-sm sm:gap-8 sm:px-6 sm:py-16 dark:bg-black">
        <div className="flex w-full items-center justify-between gap-3">
          <HubMenuButton />
          {!advancedOpen ? (
            <button
              type="button"
              className={hubHeaderButtonClass}
              onClick={() => setAdvancedOpen(true)}
              aria-expanded={false}
              aria-label="Apri impostazioni avanzate"
            >
              <img
                src="/games/wrench.svg"
                alt=""
                width={20}
                height={20}
                className={headerIconImgClass}
                aria-hidden
              />
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
              <img
                src="/games/clock-icon.svg"
                alt=""
                width={20}
                height={20}
                className={headerIconImgClass}
                aria-hidden
              />
              <span>Gioca</span>
            </button>
          )}
        </div>

        {!advancedOpen && (
          <>
            <h1 className="text-center text-2xl font-bold sm:text-3xl">Che ora è?</h1>
            <p className="text-center text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
              Scegli quali minuti possono comparire sull&apos;orologio, poi premi Inizia.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium">Categorie di minuti</span>
              <button
                className="min-h-11 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                onClick={toggleAll}
                type="button"
              >
                {selected.length === ALL_CATEGORIES.length ? "Solo la più facile" : "Seleziona tutto"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
              {CATEGORY_INFO.map(({ cat, label, points }) => (
                <label
                  key={cat}
                  className="flex min-h-11 cursor-pointer flex-col gap-1 rounded-md border border-zinc-200 px-3 py-3 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 sm:flex-row sm:items-start sm:gap-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0"
                      checked={selected.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm font-semibold sm:text-base">
                      {label}
                    </span>
                  </div>
                  <span className="pl-6 text-sm text-zinc-500 sm:pl-0 dark:text-zinc-400">
                    Minuti: {formatMinuteList(cat)} ({points} pt)
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                onClick={startGame}
                disabled={selected.length === 0}
                className="min-h-11 rounded-full px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: selected.length === 0 ? "#9ca3af" : "#2563eb" }}
                type="button"
              >
                Inizia
              </button>
            </div>
          </>
        )}

        {advancedOpen && (
          <div
            className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50 sm:p-5"
            role="region"
            aria-label="Impostazioni avanzate"
          >
            <h2 className="border-b border-zinc-200 pb-3 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
              Impostazioni avanzate
            </h2>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-medium">Formato dell&apos;ora</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="fmt"
                    className="h-4 w-4"
                    checked={timeFormat === "12h"}
                    onChange={() => setTimeFormat("12h")}
                  />
                  <span className="text-sm sm:text-base">12 ore (es. 2:35)</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="fmt"
                    className="h-4 w-4"
                    checked={timeFormat === "24h"}
                    onChange={() => setTimeFormat("24h")}
                  />
                  <span className="text-sm sm:text-base">24 ore (es. 14:35)</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-medium">Tempo per ogni domanda</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4"
                    checked={timerPreset === "unlimited"}
                    onChange={() => setTimerPreset("unlimited")}
                  />
                  <span className="text-sm sm:text-base">Illimitato</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4"
                    checked={timerPreset === 20}
                    onChange={() => setTimerPreset(20)}
                  />
                  <span className="text-sm sm:text-base">20 secondi</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4"
                    checked={timerPreset === 15}
                    onChange={() => setTimerPreset(15)}
                  />
                  <span className="text-sm sm:text-base">15 secondi</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <input
                    type="radio"
                    name="timer"
                    className="h-4 w-4"
                    checked={timerPreset === 10}
                    onChange={() => setTimerPreset(10)}
                  />
                  <span className="text-sm sm:text-base">10 secondi</span>
                </label>
              </div>
            </fieldset>
          </div>
        )}
      </main>
    </div>
  );
}

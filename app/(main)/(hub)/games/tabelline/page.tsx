"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 font-sans dark:bg-black sm:py-16">
      <main className="flex w-full max-w-3xl flex-col gap-6 rounded-xl bg-white px-4 py-8 shadow-sm sm:gap-8 sm:px-6 sm:py-16 dark:bg-black">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="min-h-11 shrink-0 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Menu
          </Link>
        </div>
        <h1 className="text-center text-2xl font-bold sm:text-3xl">Impara le Tabelline</h1>
        <p className="text-center text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          Scegli le tabelline su cui vuoi allenarti, poi premi Inizia.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">Selezione veloce</span>
          <button
            className="min-h-11 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={toggleAll}
            type="button"
          >
            {selected.length === 10 ? "Deseleziona tutto" : "Seleziona tutto"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3">
          {allTables.map((t) => (
            <label
              key={t}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0"
                checked={selected.includes(t)}
                onChange={() => toggleTable(t)}
              />
              <span className="text-sm sm:text-base">Tabellina del {t}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-center pt-4">
          <button
            onClick={startGame}
            disabled={selected.length === 0}
            className="min-h-11 rounded-full px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: selected.length === 0 ? "#9ca3af" : "#2563eb" }}
          >
            Inizia
          </button>
        </div>
      </main>
    </div>
  );
}

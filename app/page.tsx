"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const allTables = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("tables:selected");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n))) {
          setSelected(parsed.filter((n) => n >= 1 && n <= 10));
        }
      } catch {
        /* ignore */
      }
    }
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
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 py-16 px-6 bg-white dark:bg-black rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-center">Impara le Tabelline</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          Scegli le tabelline su cui vuoi allenarti, poi premi Inizia.
        </p>

        <div className="flex items-center justify-between">
          <span className="font-medium">Selezione veloce</span>
          <button
            className="rounded-md px-3 py-2 text-sm border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={toggleAll}
            type="button"
          >
            {selected.length === 10 ? "Deseleziona tutto" : "Seleziona tutto"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {allTables.map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selected.includes(t)}
                onChange={() => toggleTable(t)}
              />
              <span>Tabellina del {t}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-center pt-4">
          <button
            onClick={startGame}
            disabled={selected.length === 0}
            className="rounded-full px-6 py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: selected.length === 0 ? "#9ca3af" : "#2563eb" }}
          >
            Inizia
          </button>
        </div>
      </main>
    </div>
  );
}

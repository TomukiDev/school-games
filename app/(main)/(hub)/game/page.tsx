"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HubMenuButton from "@/components/HubMenuButton";
import { APP_GAME_IDS, saveRankingIfBest } from "@/lib/game-ranking";
import { getPointsFor } from "@/lib/difficulty";

type Question = {
  a: number;
  b: number;
  correct: number;
  options: number[];
};

const QUESTIONS_PER_LEVEL = 10;
const PASS_THRESHOLD = 6;
const BASE_SECONDS_PER_QUESTION = 10;
const MIN_SECONDS_PER_QUESTION = 4;
const FEEDBACK_MS = 1800;

function getSecondsForLevel(level: number): number {
  const seconds = BASE_SECONDS_PER_QUESTION - (level - 1);
  return Math.max(MIN_SECONDS_PER_QUESTION, seconds);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateQuestion(allowedTables: number[]): Question {
  const a = allowedTables[Math.floor(Math.random() * allowedTables.length)];
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a * b;

  const deltas = [1, 2, -1, -2, 3, -3];
  const wrongs: Set<number> = new Set();
  let attempts = 0;

  while (wrongs.size < 2 && attempts < 50) {
    attempts++;
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    const candidate = correct + delta * a;
    if (candidate > 0 && candidate !== correct) {
      wrongs.add(candidate);
    }
  }

  while (wrongs.size < 2) {
    const candidate = correct + (Math.floor(Math.random() * 9) + 1);
    if (candidate !== correct) wrongs.add(candidate);
  }

  const options = shuffle([correct, ...Array.from(wrongs).slice(0, 2)]);
  return { a, b, correct, options };
}

function GamePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const tablesParam = params.get("tables") || "";

  const allowedTables = useMemo(() => {
    const parsed = tablesParam
      .split(",")
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 10);
    if (parsed.length > 0) return parsed;
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("tables:selected");
        if (saved) {
          const arr = JSON.parse(saved) as number[];
          const valid = Array.isArray(arr) ? arr.filter((n) => n >= 1 && n <= 10) : [];
          if (valid.length > 0) return valid;
        }
      } catch {
        /* ignore */
      }
    }
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }, [tablesParam]);

  const [level, setLevel] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(allowedTables));
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(getSecondsForLevel(1));
  const [mode, setMode] = useState<"playing" | "levelEnd" | "gameOver">("playing");
  const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
  const [feedbackPoints, setFeedbackPoints] = useState<number | null>(null);
  const savedLevelEndKeyRef = useRef<string | null>(null);
  /** Prevents double advance (e.g. answer + timeout in the same tick). */
  const advanceScheduledRef = useRef(false);

  useEffect(() => {
    if (mode !== "levelEnd") return;
    const key = `tabelline-L${level}-P${score}`;
    if (savedLevelEndKeyRef.current === key) return;
    savedLevelEndKeyRef.current = key;
    void saveRankingIfBest(APP_GAME_IDS.tabelline, level, score);
  }, [mode, level, score]);

  useEffect(() => {
    if (mode !== "playing") return;
    if (lastWasCorrect !== null) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          nextQuestion(false, 0);
          return getSecondsForLevel(level);
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level, questionIndex, lastWasCorrect]);

  function nextQuestion(wasCorrect: boolean, awardedPoints: number): void {
    if (advanceScheduledRef.current) return;
    advanceScheduledRef.current = true;
    setLastWasCorrect(wasCorrect);
    setFeedbackPoints(wasCorrect ? awardedPoints : 0);
    if (wasCorrect) {
      setScore((s) => s + awardedPoints);
      setCorrectCount((c) => c + 1);
    }
    const feedbackDelay = wasCorrect ? FEEDBACK_MS : FEEDBACK_MS * 1.5;
    window.setTimeout(() => {
      if (questionIndex + 1 >= QUESTIONS_PER_LEVEL) {
        const passed = (wasCorrect ? correctCount + 1 : correctCount) >= PASS_THRESHOLD;
        advanceScheduledRef.current = false;
        setMode(passed ? "levelEnd" : "gameOver");
      } else {
        setQuestionIndex((i) => i + 1);
        setQuestion(generateQuestion(allowedTables));
        setTimeLeft(getSecondsForLevel(level));
        setLastWasCorrect(null);
        setFeedbackPoints(null);
        advanceScheduledRef.current = false;
      }
    }, feedbackDelay);
  }

  function handleAnswer(answer: number): void {
    if (mode !== "playing") return;
    if (lastWasCorrect !== null) return;
    const isCorrect = answer === question.correct;
    const pts = isCorrect ? getPointsFor(question.a, question.b) : 0;
    nextQuestion(isCorrect, pts);
  }

  function proceedToNextLevel(): void {
    advanceScheduledRef.current = false;
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setQuestionIndex(0);
    setCorrectCount(0);
    setQuestion(generateQuestion(allowedTables));
    setTimeLeft(getSecondsForLevel(nextLevel));
    setMode("playing");
    setLastWasCorrect(null);
  }

  function restartGame(): void {
    advanceScheduledRef.current = false;
    setLevel(1);
    setQuestionIndex(0);
    setCorrectCount(0);
    setScore(0);
    setQuestion(generateQuestion(allowedTables));
    setTimeLeft(getSecondsForLevel(1));
    setMode("playing");
    setLastWasCorrect(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-100 via-rose-100 to-amber-100 text-zinc-900 [color-scheme:light]">
      <header className="flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <HubMenuButton />
        <div className="flex flex-wrap items-center justify-end gap-2 sm:max-w-[min(100%,20rem)] sm:justify-end md:max-w-none">
          <span className="inline-flex min-h-10 items-center rounded-full bg-purple-200 px-3 py-1 text-sm text-purple-900">
            Livello: <strong className="ml-1">{level}</strong>
          </span>
          <span className="inline-flex min-h-10 items-center rounded-full bg-emerald-200 px-3 py-1 text-sm text-emerald-900">
            Punti: <strong className="ml-1">{score}</strong>
          </span>
          <span className="inline-flex min-h-10 items-center rounded-full bg-amber-200 px-3 py-1 text-sm text-amber-900">
            Domanda:{" "}
            <strong className="ml-1">
              {questionIndex + 1}/{QUESTIONS_PER_LEVEL}
            </strong>
          </span>
          <span className="inline-flex min-h-10 items-center rounded-full bg-sky-200 px-3 py-1 text-sm text-sky-900">
            ⏳ {timeLeft}s
          </span>
        </div>
      </header>

      <main className="w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {mode === "playing" && (
          <div className="relative flex flex-col items-center gap-6 sm:gap-8">
            <div className="mt-4 text-4xl font-extrabold text-fuchsia-800 drop-shadow-sm sm:mt-8 sm:text-5xl">
              {question.a} × {question.b}
            </div>
            <div
              className={`grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 ${
                lastWasCorrect !== null ? "pointer-events-none" : ""
              }`}
              aria-hidden={lastWasCorrect !== null}
            >
              {question.options.map((opt) => {
                const isCorrect = opt === question.correct;
                const showFeedback = lastWasCorrect !== null;
                const bg =
                  showFeedback && isCorrect
                    ? "bg-emerald-200 border-emerald-500"
                    : showFeedback && !isCorrect
                      ? "opacity-60"
                      : "hover:scale-[1.02] transition-transform";
                const palette = ["bg-rose-200", "bg-sky-200", "bg-amber-200"] as const;
                const colorClass = palette[(opt + question.a + question.b) % palette.length];
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`min-h-[52px] w-full rounded-2xl border-2 px-4 py-5 text-2xl font-extrabold text-zinc-900 sm:px-6 sm:py-6 sm:text-3xl ${bg} ${colorClass}`}
                    disabled={lastWasCorrect !== null}
                    type="button"
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {lastWasCorrect !== null && (
              <div className="absolute inset-0 z-10 flex touch-none items-center justify-center px-2">
                <div
                  className={`max-w-sm rounded-2xl border-2 px-6 py-5 text-center shadow-lg sm:px-8 sm:py-6 ${
                    lastWasCorrect
                      ? "border-emerald-400 bg-emerald-100 text-emerald-950"
                      : "border-rose-400 bg-rose-100 text-rose-950"
                  }`}
                >
                  <div className="text-3xl font-extrabold sm:text-5xl">
                    {lastWasCorrect ? "🎉 Corretto!" : "😅 Peccato!"}
                  </div>
                  {!lastWasCorrect && (
                    <p className="mt-3 text-2xl font-semibold leading-snug text-rose-900 sm:text-xl">
                      La risposta è:{" "}
                      <span className="font-extrabold">
                        {question.a} x {question.b} = {question.correct}
                      </span>
                    </p>
                  )}
                  {lastWasCorrect && feedbackPoints !== null && feedbackPoints > 0 && (
                    <div className="mt-2 text-xl font-bold text-emerald-800 sm:text-2xl">
                      +{feedbackPoints} punti
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "levelEnd" && (
          <div className="flex flex-col items-center gap-6 pt-10 sm:pt-16">
            <h2 className="text-center text-3xl font-extrabold text-emerald-800 sm:text-4xl">
              Livello superato! 🎯
            </h2>
            <p className="text-center text-zinc-800">
              Risposte corrette: {correctCount}/{QUESTIONS_PER_LEVEL} • Punteggio: {score}
            </p>
            <button
              onClick={proceedToNextLevel}
              className="min-h-11 rounded-full px-8 py-3 font-semibold text-white"
              style={{ backgroundColor: "#16a34a" }}
              type="button"
            >
              Prossimo livello
            </button>
          </div>
        )}

        {mode === "gameOver" && (
          <div className="flex flex-col items-center gap-6 pt-10 sm:pt-16">
            <h2 className="text-center text-3xl font-extrabold text-rose-800 sm:text-4xl">Game Over 💫</h2>
            <p className="max-w-md text-center text-zinc-800">
              Hai risposto correttamente a {correctCount} su {QUESTIONS_PER_LEVEL}. Servono almeno {PASS_THRESHOLD}{" "}
              per passare.
            </p>
            <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={restartGame}
                className="min-h-11 rounded-full px-8 py-3 font-semibold text-white"
                style={{ backgroundColor: "#2563eb" }}
                type="button"
              >
                Riprova
              </button>
              <button
                onClick={() => router.push("/games/tabelline")}
                className="min-h-11 rounded-full border border-zinc-400 bg-white px-8 py-3 font-semibold text-zinc-900"
                type="button"
              >
                Cambia tabelline
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 to-amber-100 text-zinc-900 [color-scheme:light]">
          <p className="text-zinc-700">Caricamento…</p>
        </div>
      }
    >
      <GamePageInner />
    </Suspense>
  );
}

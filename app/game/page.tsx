"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const b = Math.floor(Math.random() * 10) + 1; // 1..10
  const correct = a * b;

  const deltas = [1, 2, -1, -2, 3, -3];
  const wrongs: Set<number> = new Set();
  let attempts = 0;

  while (wrongs.size < 2 && attempts < 50) {
    attempts++;
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    const candidate = correct + delta * a; // keeps relation with table
    if (candidate > 0 && candidate !== correct) {
      wrongs.add(candidate);
    }
  }

  // Fallback in rare cases
  while (wrongs.size < 2) {
    const candidate = correct + (Math.floor(Math.random() * 9) + 1);
    if (candidate !== correct) wrongs.add(candidate);
  }

  const options = shuffle([correct, ...Array.from(wrongs).slice(0, 2)]);
  return { a, b, correct, options };
}

export default function GamePage() {
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
    // default to all if none provided
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }, [tablesParam]);

  const [level, setLevel] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState<number>(0); // 0..9
  const [question, setQuestion] = useState<Question>(() => generateQuestion(allowedTables));
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(getSecondsForLevel(1));
  const [mode, setMode] = useState<"playing" | "levelEnd" | "gameOver">("playing");
  const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
  const [feedbackPoints, setFeedbackPoints] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // time over -> move to next question without points
          nextQuestion(false, 0);
          return getSecondsForLevel(level); // will be reset anyway in nextQuestion
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level, questionIndex]);

  function nextQuestion(wasCorrect: boolean, awardedPoints: number): void {
    setLastWasCorrect(wasCorrect);
    setFeedbackPoints(wasCorrect ? awardedPoints : 0);
    if (wasCorrect) {
      setScore((s) => s + awardedPoints);
      setCorrectCount((c) => c + 1);
    }
    setTimeout(() => {
      if (questionIndex + 1 >= QUESTIONS_PER_LEVEL) {
        // end of level
        const passed = (wasCorrect ? correctCount + 1 : correctCount) >= PASS_THRESHOLD;
        setMode(passed ? "levelEnd" : "gameOver");
      } else {
        // next question
        setQuestionIndex((i) => i + 1);
        setQuestion(generateQuestion(allowedTables));
        setTimeLeft(getSecondsForLevel(level));
        setLastWasCorrect(null);
        setFeedbackPoints(null);
      }
    }, FEEDBACK_MS);
  }

  function handleAnswer(answer: number): void {
    if (mode !== "playing") return;
    if (lastWasCorrect !== null) return; // prevent double clicks during feedback
    const isCorrect = answer === question.correct;
    const pts = isCorrect ? getPointsFor(question.a, question.b) : 0;
    nextQuestion(isCorrect, pts);
  }

  function proceedToNextLevel(): void {
    setLevel((l) => l + 1);
    setQuestionIndex(0);
    setCorrectCount(0);
    setQuestion(generateQuestion(allowedTables));
    const nextLevel = level + 1;
    setTimeLeft(getSecondsForLevel(nextLevel));
    setMode("playing");
    setLastWasCorrect(null);
  }

  function restartGame(): void {
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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-sky-100 via-rose-100 to-amber-100 dark:bg-black">
      <header className="w-full max-w-3xl flex items-center justify-between px-6 py-4">
        <button
          className="text-sm text-sky-700 hover:underline dark:text-zinc-400"
          onClick={() => router.push("/")}
          type="button"
        >
          ← Home
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm rounded-full px-3 py-1 bg-purple-200 text-purple-900">
            Livello: <strong>{level}</strong>
          </span>
          <span className="text-xs sm:text-sm rounded-full px-3 py-1 bg-emerald-200 text-emerald-900">
            Punti: <strong>{score}</strong>
          </span>
          <span className="text-xs sm:text-sm rounded-full px-3 py-1 bg-amber-200 text-amber-900">
            Domanda: <strong>{questionIndex + 1}/{QUESTIONS_PER_LEVEL}</strong>
          </span>
          <span className="text-xs sm:text-sm rounded-full px-3 py-1 bg-sky-200 text-sky-900">
            ⏳ {timeLeft}s
          </span>
        </div>
      </header>

      <main className="w-full max-w-3xl flex-1 px-6 py-8">
        {mode === "playing" && (
          <div className="relative flex flex-col items-center gap-8">
            <div className="text-5xl font-extrabold mt-8 text-fuchsia-700 drop-shadow-sm">
              {question.a} × {question.b}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {question.options.map((opt) => {
                const isCorrect = opt === question.correct;
                const showFeedback = lastWasCorrect !== null;
                const bg =
                  showFeedback && isCorrect
                    ? "bg-emerald-200 border-emerald-400"
                    : showFeedback && !isCorrect
                    ? "opacity-60"
                    : "hover:scale-[1.02] transition-transform";
                const palette = ["bg-rose-200", "bg-sky-200", "bg-amber-200"] as const;
                const colorClass = palette[(opt + question.a + question.b) % palette.length];
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full rounded-2xl border-2 px-6 py-6 text-3xl font-extrabold ${bg} ${colorClass}`}
                    disabled={lastWasCorrect !== null}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {lastWasCorrect !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`rounded-2xl px-8 py-6 text-center shadow-lg border-2 ${
                    lastWasCorrect
                      ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                      : "bg-rose-100 border-rose-300 text-rose-900"
                  }`}
                >
                  <div className="text-4xl sm:text-5xl font-extrabold">
                    {lastWasCorrect ? "🎉 Corretto!" : "😅 Peccato!"}
                  </div>
                  {lastWasCorrect && feedbackPoints !== null && feedbackPoints > 0 && (
                    <div className="mt-2 text-2xl font-bold text-emerald-700">
                      +{feedbackPoints} punti
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "levelEnd" && (
          <div className="flex flex-col items-center gap-6 pt-16">
            <h2 className="text-4xl font-extrabold text-emerald-700">Livello superato! 🎯</h2>
            <p className="text-zinc-700">
              Risposte corrette: {correctCount}/{QUESTIONS_PER_LEVEL} • Punteggio: {score}
            </p>
            <button
              onClick={proceedToNextLevel}
              className="rounded-full px-8 py-3 font-semibold text-white"
              style={{ backgroundColor: "#16a34a" }}
            >
              Prossimo livello
            </button>
          </div>
        )}

        {mode === "gameOver" && (
          <div className="flex flex-col items-center gap-6 pt-16">
            <h2 className="text-4xl font-extrabold text-rose-700">Game Over 💫</h2>
            <p className="text-zinc-700">
              Hai risposto correttamente a {correctCount} su {QUESTIONS_PER_LEVEL}. Servono almeno {PASS_THRESHOLD} per passare.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={restartGame}
                className="rounded-full px-8 py-3 font-semibold text-white"
                style={{ backgroundColor: "#2563eb" }}
              >
                Riprova
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-full px-8 py-3 font-semibold border border-zinc-300 dark:border-zinc-700 bg-white"
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


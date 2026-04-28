"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalogClock from "./AnalogClock";
import HubMenuButton from "@/components/HubMenuButton";
import { APP_GAME_IDS, saveRankingIfBest } from "@/lib/game-ranking";
import {
  type ClockQuestion,
  type ClockTimerPreset,
  type MinuteCategory,
  type TimeFormat,
  DEFAULT_CLOCK_TIMER_PRESET,
  FEEDBACK_MS,
  PASS_THRESHOLD,
  QUESTIONS_PER_LEVEL,
  generateClockQuestion,
  getPointsForMinute,
  getSecondsForLevel,
  isClockTimerPreset,
  parseCategoriesParam,
  parseFormatParam,
  parseTimerPresetParam,
} from "@/lib/clock";

const STORAGE_KEY = "clock:setup";

function ClockGameInner() {
  const router = useRouter();
  const params = useSearchParams();
  const catsParam = params.get("cats");
  const fmtParam = params.get("fmt");
  const timerParam = params.get("timer");

  const categories = useMemo((): MinuteCategory[] => {
    const fromUrl = parseCategoriesParam(catsParam);
    if (fromUrl && fromUrl.length > 0) return fromUrl;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { categories?: unknown };
          if (Array.isArray(parsed.categories)) {
            const valid = parsed.categories.filter(
              (n): n is MinuteCategory => n === 1 || n === 2 || n === 3 || n === 4,
            );
            if (valid.length > 0) return valid.sort((a, b) => a - b);
          }
        }
      } catch {
        /* ignore */
      }
    }
    return [1, 2, 3, 4];
  }, [catsParam]);

  const timeFormat = useMemo((): TimeFormat => {
    const fromUrl = parseFormatParam(fmtParam);
    if (fromUrl) return fromUrl;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { format?: unknown };
          if (parsed.format === "12h" || parsed.format === "24h") return parsed.format;
        }
      } catch {
        /* ignore */
      }
    }
    return "24h";
  }, [fmtParam]);

  const timerPreset = useMemo((): ClockTimerPreset => {
    const fromUrl = parseTimerPresetParam(timerParam);
    if (fromUrl !== null) return fromUrl;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { timerPreset?: unknown };
          if (isClockTimerPreset(parsed.timerPreset)) return parsed.timerPreset;
        }
      } catch {
        /* ignore */
      }
    }
    return DEFAULT_CLOCK_TIMER_PRESET;
  }, [timerParam]);

  const [level, setLevel] = useState<number>(1);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [question, setQuestion] = useState<ClockQuestion>(() =>
    generateClockQuestion(categories, 1, timeFormat),
  );
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(() => getSecondsForLevel(1, timerPreset));
  const [mode, setMode] = useState<"playing" | "levelEnd" | "gameOver">("playing");
  const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
  const [feedbackPoints, setFeedbackPoints] = useState<number | null>(null);
  const savedLevelEndKeyRef = useRef<string | null>(null);
  /** Prevents double advance (e.g. answer + timeout in the same tick). */
  const advanceScheduledRef = useRef(false);

  useEffect(() => {
    if (mode !== "levelEnd") return;
    const key = `orologio-L${level}-P${score}`;
    if (savedLevelEndKeyRef.current === key) return;
    savedLevelEndKeyRef.current = key;
    void saveRankingIfBest(APP_GAME_IDS.orologio, level, score);
  }, [mode, level, score]);

  useEffect(() => {
    if (mode !== "playing") return;
    if (lastWasCorrect !== null) return;
    if (timerPreset === "unlimited") return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          nextQuestion(false, 0);
          return getSecondsForLevel(level, timerPreset);
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level, questionIndex, lastWasCorrect, timerPreset]);

  function nextQuestion(wasCorrect: boolean, awardedPoints: number): void {
    if (advanceScheduledRef.current) return;
    advanceScheduledRef.current = true;
    setLastWasCorrect(wasCorrect);
    setFeedbackPoints(wasCorrect ? awardedPoints : 0);
    if (wasCorrect) {
      setScore((s) => s + awardedPoints);
      setCorrectCount((c) => c + 1);
    }
    window.setTimeout(() => {
      if (questionIndex + 1 >= QUESTIONS_PER_LEVEL) {
        const passed = (wasCorrect ? correctCount + 1 : correctCount) >= PASS_THRESHOLD;
        advanceScheduledRef.current = false;
        setMode(passed ? "levelEnd" : "gameOver");
      } else {
        setQuestionIndex((i) => i + 1);
        setQuestion(generateClockQuestion(categories, level, timeFormat));
        setTimeLeft(getSecondsForLevel(level, timerPreset));
        setLastWasCorrect(null);
        setFeedbackPoints(null);
        advanceScheduledRef.current = false;
      }
    }, (wasCorrect ? FEEDBACK_MS : FEEDBACK_MS * 1.5));
  }

  function handleAnswer(answer: string): void {
    if (mode !== "playing") return;
    if (lastWasCorrect !== null) return;
    const isCorrect = answer === question.correctLabel;
    const pts = isCorrect ? getPointsForMinute(question.minute) : 0;
    nextQuestion(isCorrect, pts);
  }

  function proceedToNextLevel(): void {
    advanceScheduledRef.current = false;
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setQuestionIndex(0);
    setCorrectCount(0);
    setQuestion(generateClockQuestion(categories, nextLevel, timeFormat));
    setTimeLeft(getSecondsForLevel(nextLevel, timerPreset));
    setMode("playing");
    setLastWasCorrect(null);
  }

  function restartGame(): void {
    advanceScheduledRef.current = false;
    setLevel(1);
    setQuestionIndex(0);
    setCorrectCount(0);
    setScore(0);
    setQuestion(generateClockQuestion(categories, 1, timeFormat));
    setTimeLeft(getSecondsForLevel(1, timerPreset));
    setMode("playing");
    setLastWasCorrect(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-violet-100 via-amber-50 to-cyan-100 text-zinc-900 [color-scheme:light]">
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
            ⏳ {Number.isFinite(timeLeft) ? `${Math.floor(timeLeft)}s` : "Illimitato"}
          </span>
        </div>
      </header>

      <main className="w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {mode === "playing" && (
          <div className="relative flex flex-col items-center gap-6 sm:gap-8">
            <p className="text-center text-lg font-bold text-violet-900 sm:text-xl">
              Che ora è sull&apos;orologio?
            </p>
            <AnalogClock hour24={question.hour24} minute={question.minute} />
            <div
              className={`grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 ${
                lastWasCorrect !== null ? "pointer-events-none" : ""
              }`}
              aria-hidden={lastWasCorrect !== null}
            >
              {question.options.map((opt, idx) => {
                const isCorrect = opt === question.correctLabel;
                const showFeedback = lastWasCorrect !== null;
                const bg =
                  showFeedback && isCorrect
                    ? "bg-emerald-200 border-emerald-500"
                    : showFeedback && !isCorrect
                      ? "opacity-60"
                      : "hover:scale-[1.02] transition-transform";
                const colorClass = question.optionColors[idx % question.optionColors.length];
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
                      <span className="whitespace-nowrap font-extrabold">{question.correctLabel}</span>
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
                onClick={() => router.push("/games/orologio")}
                className="min-h-11 rounded-full border border-zinc-400 bg-white px-8 py-3 font-semibold text-zinc-900"
                type="button"
              >
                Cambia impostazioni
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClockGamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-100 to-cyan-100 text-zinc-900 [color-scheme:light]">
          <p className="text-zinc-700">Caricamento…</p>
        </div>
      }
    >
      <ClockGameInner />
    </Suspense>
  );
}

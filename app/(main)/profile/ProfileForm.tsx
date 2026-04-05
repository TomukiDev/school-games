"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOutClient } from "@/lib/auth/sign-out-client";

type Props = {
  userId: string;
  email: string;
  initialFullName: string;
  initialBirthDate: string;
  setup: boolean;
};

export default function ProfileForm({
  userId,
  email,
  initialFullName,
  initialBirthDate,
  setup,
}: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [emailField, setEmailField] = useState(email);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const supabase = createClient();
    const trimmed = fullName.trim();
    const completed = Boolean(trimmed && birthDate);

    if (emailField.trim() !== email) {
      const { error: emailErr } = await supabase.auth.updateUser({
        email: emailField.trim(),
      });
      if (emailErr) {
        setLoading(false);
        setError(emailErr.message);
        return;
      }
      setStatus(
        "Se richiesto, conferma il nuovo indirizzo email dal messaggio che ti abbiamo inviato.",
      );
    }

    const { error: upErr } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: trimmed || null,
        birth_date: birthDate || null,
        profile_completed: completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    setLoading(false);

    if (upErr) {
      setError(upErr.message);
      return;
    }

    if (completed) {
      router.push("/");
      router.refresh();
    } else {
      setStatus("Profilo salvato. Compila nome e data di nascita per continuare.");
    }
  }

  async function signOut() {
    await signOutClient(router);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Profilo</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {setup
              ? "Completa i dati per iniziare a giocare."
              : "Aggiorna le informazioni del giocatore."}
          </p>
        </div>
        <Link
          href="/"
          className="min-h-11 shrink-0 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Menu
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nome
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Come ti chiami"
          />
        </div>

        <div>
          <label htmlFor="birth_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Data di nascita
          </label>
          <input
            id="birth_date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={emailField}
            onChange={(e) => setEmailField(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {status}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Salva
        </button>
      </form>

      <button
        type="button"
        onClick={signOut}
        className="min-h-11 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        Esci
      </button>
    </div>
  );
}

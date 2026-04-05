"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { FacebookFIcon, GoogleGIcon } from "./oauth-icons";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    urlError === "auth" ? "Accesso social non riuscito. Riprova." : null,
  );
  const [loading, setLoading] = useState(false);

  async function oauth(provider: Provider) {
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=/`,
      },
    });
    setLoading(false);
    if (oauthErr) {
      setError(oauthErr.message);
    }
  }

  async function submitLocal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      setLoading(false);
      if (signErr) {
        setError(authErrorMessage(signErr.code, signErr.message));
        return;
      }
      setMessage(
        "Controlla la casella email per confermare l’account, oppure accedi se la conferma non è richiesta.",
      );
      return;
    }

    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signErr) {
      setError(authErrorMessage(signErr.code, signErr.message));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Accedi
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Usa le tue credenziali oppure registrati
      </p>
{/*}
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Usa un account social oppure email e password.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => oauth("google")}
          aria-label="Continua con Google"
          className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#747775] bg-white px-3 py-2.5 text-sm font-medium text-[#1F1F1F] transition hover:bg-zinc-50 disabled:opacity-50 dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-zinc-900"
        >
          <GoogleGIcon className="h-5 w-5 shrink-0" />
          <span>Continua con Google</span>
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => oauth("facebook")}
          aria-label="Continua con Facebook"
          className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#1877F2] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#166fe5] disabled:opacity-50"
        >
          <FacebookFIcon className="h-5 w-5 shrink-0 text-white" />
          <span>Continua con Facebook</span>
        </button>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide text-zinc-500">
          <span className="bg-white px-2 dark:bg-zinc-950">oppure account locale</span>
        </div>
      </div>
*/}
      <div className="mb-4 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          type="button"
          className={`min-h-10 flex-1 rounded-md text-sm font-medium transition ${
            mode === "signin"
              ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
          onClick={() => setMode("signin")}
        >
          Accedi
        </button>
        <button
          type="button"
          className={`min-h-10 flex-1 rounded-md text-sm font-medium transition ${
            mode === "signup"
              ? "bg-white text-zinc-900 shadow dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
          onClick={() => setMode("signup")}
        >
          Registrati
        </button>
      </div>

      <form onSubmit={submitLocal} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mode === "signup" ? "Crea account" : "Entra"}
        </button>
      </form>
    </div>
  );
}

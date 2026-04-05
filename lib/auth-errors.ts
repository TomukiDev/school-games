/** Messaggi in italiano per errori comuni di Supabase Auth */
export function authErrorMessage(code: string | undefined, fallback: string): string {
  if (!code) return fallback;
  const map: Record<string, string> = {
    invalid_credentials: "Email o password non corretti.",
    user_not_found: "Utente non trovato.",
    email_not_confirmed: "Conferma l’indirizzo email prima di accedere.",
    weak_password: "La password non è abbastanza sicura.",
    user_already_exists: "Esiste già un account con questa email.",
    signup_disabled: "Le registrazioni sono disabilitate.",
    email_address_invalid: "Indirizzo email non valido.",
    flow_state_expired: "Sessione scaduta. Riprova.",
  };
  return map[code] ?? fallback;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutClient } from "@/lib/auth/sign-out-client";

const iconBtnClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

function ProfileCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (

    <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden
          viewBox="0 0 71.69 122.88">
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M1.19,0.02h25.91l23.34,42.45c0.5,0.9,1.23,1.61,2.06,2.06H17.66L1.19,0V0.02L1.19,0.02z M35.85,51.19 c19.8,0,35.85,16.05,35.85,35.85s-16.05,35.85-35.85,35.85C16.05,122.88,0,106.83,0,87.03S16.05,51.19,35.85,51.19L35.85,51.19z M35.85,66.34l5.99,14.62l15.77,1.19L45.54,92.39l3.75,15.34L35.85,99.4l-13.44,8.33l3.75-15.34L14.08,82.14l15.77-1.19 L35.85,66.34L35.85,66.34L35.85,66.34z M39.03,0.02h30.32L57.15,33L39.03,0.02L39.03,0.02z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function HubHeaderActions() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href="/rankings" className={iconBtnClass} aria-label="Miei punteggi">
        <TrophyIcon />
      </Link>
      <Link href="/profile" className={iconBtnClass} aria-label="Apri profilo">
        <ProfileCircleIcon />
      </Link>
      <button
        type="button"
        className={iconBtnClass}
        aria-label="Esci"
        onClick={() => void signOutClient(router)}
      >
        <LogoutIcon />
      </button>
    </div>
  );
}

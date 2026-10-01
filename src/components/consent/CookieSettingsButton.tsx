"use client";

import { resetChoice } from "./consent-store";

/** Reopens the analytics choice. Only rendered when analytics is configured. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={resetChoice}
      className="inline-flex min-h-11 shrink-0 items-center text-micro font-semibold text-ink underline underline-offset-4 hover:decoration-2"
    >
      Cookie settings
    </button>
  );
}

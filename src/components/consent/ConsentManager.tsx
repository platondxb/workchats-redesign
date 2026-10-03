"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useSyncExternalStore } from "react";
import { liquidClasses } from "@/components/ui/button-classes";
import { getServerSnapshot, getSnapshot, setChoice, subscribe } from "./consent-store";

interface ConsentManagerProps {
  gaId: string;
  policyHref: string;
}

/**
 * Loads Google Analytics only after the visitor accepts. Until then there is no request to Google
 * and no cookie. Accept and Reject carry equal weight. The banner is a small non-modal panel,
 * so it never covers the page's call to action. Review the wording against the cookie policy before
 * setting NEXT_PUBLIC_GA_MEASUREMENT_ID.
 */
export function ConsentManager({ gaId, policyHref }: ConsentManagerProps) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (state === "granted") return <GoogleAnalytics gaId={gaId} />;
  if (state !== "unset") return null;

  return (
    <section
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-banner border-t border-night-line bg-night-raised px-(--gutter) py-4 shadow-overlay md:inset-x-auto md:bottom-4 md:left-4 md:max-w-112 md:rounded-md md:border md:px-5"
    >
      <p className="text-small text-on-night">
        We&apos;d like to use Google Analytics cookies to see how people use this site. Nothing is set unless
        you accept.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={liquidClasses("glass", "sm")} onClick={() => setChoice("granted")}>
          Accept analytics
        </button>
        <button
          type="button"
          className={liquidClasses("glass", "sm")}
          onClick={() => {
            disableAnalytics(gaId);
            setChoice("denied");
          }}
        >
          Reject
        </button>
        <a
          href={policyHref}
          className="inline-flex min-h-11 items-center px-2 text-small font-semibold text-accent-on-night underline underline-offset-4"
        >
          Cookie policy
        </a>
      </div>
    </section>
  );
}

/** Stops further hits and removes Google Analytics cookies if a previous "accept" is withdrawn. */
function disableAnalytics(gaId: string): void {
  (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
  const expired = "=; Max-Age=0; path=/";
  const domain = window.location.hostname.replace(/^www\./, "");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name?.startsWith("_ga")) continue;
    document.cookie = `${name}${expired}`;
    document.cookie = `${name}${expired}; domain=.${domain}`;
  }
}

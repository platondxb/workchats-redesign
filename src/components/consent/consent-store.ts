"use client";

/**
 * The visitor's analytics choice, kept in localStorage (first-party, never sent to a server).
 * Read through useSyncExternalStore, so the server render and first client render agree ("pending")
 * and the banner only appears after hydration.
 */

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unset" | "pending";

const STORAGE_KEY = "wc-analytics-consent";
const listeners = new Set<() => void>();
let memoryFallback: ConsentChoice | null = null;

function read(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return memoryFallback;
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): ConsentState {
  return read() ?? "unset";
}

export function getServerSnapshot(): ConsentState {
  return "pending";
}

export function setChoice(choice: ConsentChoice): void {
  memoryFallback = choice;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  listeners.forEach((listener) => listener());
}

/** Shows the banner again (footer "Cookie settings"). */
export function resetChoice(): void {
  memoryFallback = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
  listeners.forEach((listener) => listener());
}

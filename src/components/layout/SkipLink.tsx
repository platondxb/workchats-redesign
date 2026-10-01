/** First focusable element on every page. Visible only when focused. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-sm bg-accent px-4 py-3 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Skip to content
    </a>
  );
}

import { billingCurrency, displayCurrencies } from "@/content/pricing";
import { cx } from "@/lib/cx";

/**
 * The currency chooser, shared by the pricing cards and the cost calculator.
 *
 * Each instance is its own native radio group with its own ids — two controls cannot share one group
 * without becoming a single tab stop that spans half the page — and CSS shows the matching figure (the
 * currency-* and cost-currency-* variants in globals.css), so both work before and without JavaScript.
 * A small inline script keeps the two choices in step and remembers the visitor's pick for the session.
 */
export function CurrencySwitch({
  name,
  legend,
  tone = "light",
  className,
}: {
  /** The radio group's name, e.g. "currency" or "cost-currency". Ids are built from it. */
  name: string;
  legend: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <fieldset className={cx("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <legend
        className={cx(
          "float-left mr-1 text-small font-semibold",
          dark ? "text-on-night-muted" : "text-ink-muted",
        )}
      >
        {legend}
      </legend>
      <span
        className={cx(
          "inline-flex flex-wrap rounded-full border p-1",
          dark ? "border-night-line bg-night" : "border-line bg-surface",
        )}
      >
        {displayCurrencies.map((currency) => (
          <label
            key={currency.code}
            className={cx(
              "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-3 text-micro font-semibold transition-colors",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
              dark
                ? "text-on-night-muted hover:text-on-night has-checked:bg-surface has-checked:text-ink"
                : "text-ink-muted hover:text-ink has-checked:bg-ink has-checked:text-on-accent",
            )}
          >
            <input
              type="radio"
              name={name}
              id={`${name}-${currency.code.toLowerCase()}`}
              value={currency.code}
              defaultChecked={currency.code === billingCurrency}
              aria-label={`${currency.label} (${currency.code})`}
              className="sr-only"
            />
            {currency.code}
          </label>
        ))}
      </span>
    </fieldset>
  );
}

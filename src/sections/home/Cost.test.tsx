import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cost } from "./Cost";

/** What each row's price reads in every currency the page offers, in the list's order. */
const prices = {
  GBP: ["£7.25", "£11.99", "£10", "£0", "£12"],
  USD: ["$9", "$15", "$12.50", "$0", "$15"],
  EUR: ["€8.50", "€14", "€11.50", "€0", "€14"],
  AED: ["Dh 34", "Dh 56", "Dh 46.50", "Dh 0", "Dh 56"],
  RUB: ["₽761.50", "₽1,259", "₽1,050", "₽0", "₽1,260"],
} as const;

function rows() {
  render(<Cost />);
  return within(screen.getByRole("list")).getAllByRole("listitem");
}

describe("Cost", () => {
  it("names the app and plan behind each row, in the order of the cost breakdown", () => {
    const names = rows().map((row) => row.firstElementChild?.firstChild?.textContent);
    expect(names).toEqual([
      "Slack Pro",
      "Zoom Workplace Pro",
      "Loom Business",
      "WhatsApp",
      "Google Workspace Business Standard",
    ]);
  });

  it("gives every row's price in every currency, so the currency switch can change them", () => {
    const list = rows();
    for (const [code, expected] of Object.entries(prices)) {
      const shown = list.map((row) => row.querySelector(`[data-currency="${code}"]`)?.textContent);
      expect(shown, code).toEqual(expected);
    }
  });

  it("shows pounds until another currency is chosen, as the calculator's totals do", () => {
    const [first] = rows();
    expect(first?.querySelector('[data-currency="GBP"]')).toHaveClass("inline");
    expect(first?.querySelector('[data-currency="USD"]')).toHaveClass("hidden");
  });

  it("marks the one app that stays, and only that one", () => {
    render(<Cost />);
    expect(screen.getAllByText("You keep this one")).toHaveLength(1);
    const row = screen.getByText("Google Workspace Business Standard").closest("li");
    expect(row).toHaveTextContent("You keep this one");
  });
});

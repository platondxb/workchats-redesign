import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { plans } from "@/content/pricing";
import { Pricing } from "./Pricing";

describe("Pricing", () => {
  it("shows one card per plan, each with its own action", () => {
    render(<Pricing />);
    for (const plan of plans) {
      const card = screen.getByRole("article", { name: plan.name });
      const action = within(card).getByRole("link", { name: plan.cta.label });
      expect(action).toHaveAttribute("href", plan.cta.href);
    }
  });

  it("renders both billing periods and every display currency into the HTML", () => {
    render(<Pricing />);
    const pro = screen.getByRole("article", { name: "Pro" });
    for (const price of ["£3", "£4", "$4", "$5", "€3.50", "€4.50", "Dh 14", "Dh 18.50", "₽315", "₽420"]) {
      expect(within(pro).getByText(price)).toBeInTheDocument();
    }
    const max = screen.getByRole("article", { name: "Max" });
    for (const price of ["£5", "£7", "$6.50", "$9"]) {
      expect(within(max).getByText(price)).toBeInTheDocument();
    }
  });

  it("defaults to pounds sterling, the billing currency, and names each currency in full", () => {
    render(<Pricing />);
    expect(screen.getByRole("radio", { name: "Pound sterling (GBP)" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "US dollar (USD)" })).not.toBeChecked();
    expect(screen.getByText(/Prices in other currencies are approximate/)).toBeInTheDocument();
  });

  it("never offers a free sign-up for the custom-priced tier", () => {
    render(<Pricing />);
    const enterprise = screen.getByRole("article", { name: "Enterprise" });
    expect(within(enterprise).queryByRole("link", { name: /free/i })).toBeNull();
    expect(within(enterprise).getByText("Custom")).toBeInTheDocument();
  });

  it("states the saving from the data, rounded down, on the annual option", () => {
    render(<Pricing />);
    expect(screen.getByRole("radio", { name: /Annually.*Save up to 28%/ })).toBeChecked();
  });

  it("has a polite live region for the price announcement", () => {
    const { container } = render(<Pricing />);
    expect(container.querySelector("#pricing-status")).toHaveAttribute("aria-live", "polite");
  });
});

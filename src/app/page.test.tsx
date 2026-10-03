import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { findCompetitorNames } from "@/content/competitors";
import { customers, platforms } from "@/content/site";
import { homeJsonLd } from "@/lib/structured-data";
import HomePage, { metadata } from "./page";

/** The whole page, rendered as it is prerendered (without the root layout's header and footer). */
function renderPage() {
  return render(<HomePage />);
}

function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Missing ${what}`);
  return value;
}

describe("the home page", () => {
  it("never names or describes a competing product, in the page, its metadata or its structured data", () => {
    const { container } = renderPage();
    expect(findCompetitorNames(container.innerHTML)).toEqual([]);
    expect(findCompetitorNames(JSON.stringify(metadata))).toEqual([]);
    expect(findCompetitorNames(JSON.stringify(homeJsonLd()))).toEqual([]);
  });

  it("has one h1 that says what Workchats is and that 5 people use it free", () => {
    renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Team chat, calls and files.Free for up to 5 people.");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("offers every download as a pressable control that goes nowhere until a link is set", () => {
    const { container } = renderPage();
    const downloads = within(required(container.querySelector<HTMLElement>("#download"), "#download"));
    for (const platform of platforms) {
      const control = downloads.getByRole(platform.href ? "link" : "button", {
        name: new RegExp(`^${platform.label}`),
      });
      if (platform.href) expect(control).toHaveAttribute("href", platform.href);
      else expect(control).not.toHaveAttribute("href");
    }
  });

  it("gives the hero's download a neutral label until the visitor's platform is known", () => {
    renderPage();
    const download = screen.getByRole("link", { name: /^Download the app/ });
    expect(download).toHaveAttribute("href", "#download");
    // Every platform's label is in the HTML, so CSS can pick one before the first paint.
    for (const platform of platforms) expect(download).toHaveTextContent(platform.cta);
  });

  it("names its customers as text, never as logo images", () => {
    const { container } = renderPage();
    const strip = required(
      container.querySelector<HTMLElement>("[aria-labelledby='customers-title']"),
      "the customers strip",
    );
    expect(
      within(strip)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(customers.names);
    expect(strip.querySelector("img, svg")).toBeNull();
  });

  it("starts the business case with the facts an approver asks for", () => {
    renderPage();
    const brief = screen.getByRole("article", { name: "Workchats in brief" });
    for (const term of ["Cost", "What it replaces", "Reliability", "Encryption", "Data residency"]) {
      expect(within(brief).getByText(term)).toBeInTheDocument();
    }
  });

  it("describes the devices in words, as one picture", () => {
    renderPage();
    expect(screen.getByRole("img", { name: /rings on Daniel Novak's phone/ })).toBeInTheDocument();
  });
});

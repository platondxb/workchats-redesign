import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { liquidClasses } from "./button-classes";
import { LiquidButton } from "./liquid-glass-button";

describe("the shiny tone", () => {
  it("is the shiny-cta pill, without the glass rim or the spring the other tones carry", () => {
    const shiny = liquidClasses("shiny", "md");
    expect(shiny.split(" ")).toContain("shiny-cta");
    // It draws its own ::before and ::after, so the shared rim classes would fight them.
    expect(shiny).not.toMatch(/before:/);
    expect(shiny).not.toMatch(/hover:scale|active:scale|transition-\[/);
    for (const tone of ["primary", "glass"] as const) {
      const other = liquidClasses(tone, "md");
      expect(other).toContain("before:rounded-full");
      expect(other.split(" ")).not.toContain("shiny-cta");
    }
  });

  it("keeps the size's tap target", () => {
    expect(liquidClasses("shiny", "md")).toContain("min-h-12");
    expect(liquidClasses("shiny", "sm")).toContain("min-h-11");
  });

  it("wraps the label in a span, which holds the glow, and keeps the link's name", () => {
    render(
      <LiquidButton href="/go" tone="shiny">
        Start with Max
      </LiquidButton>,
    );
    const link = screen.getByRole("link", { name: "Start with Max" });
    expect(link).toHaveClass("shiny-cta");
    expect(link.querySelector(":scope > span")).toHaveTextContent("Start with Max");
  });

  it("does the same for a real button, and leaves the other tones' markup alone", () => {
    const { rerender } = render(<LiquidButton tone="shiny">Go</LiquidButton>);
    expect(screen.getByRole("button", { name: "Go" }).querySelector(":scope > span")).not.toBeNull();
    rerender(<LiquidButton tone="glass">Go</LiquidButton>);
    expect(screen.getByRole("button", { name: "Go" }).querySelector("span")).toBeNull();
  });
});

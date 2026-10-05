import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cost } from "./Cost";

describe("Cost", () => {
  it("names the app and plan behind each price, at the price it is listed for", () => {
    render(<Cost />);
    const list = screen.getByRole("list");
    const rows = within(list)
      .getAllByRole("listitem")
      .map((row) => row.textContent);
    expect(rows).toEqual([
      "Slack Pro£7.25",
      "Zoom Workplace Pro£11.99",
      "Loom Business£10",
      "WhatsApp£0",
      "Google Workspace Business StandardYou keep this one£12",
    ]);
  });

  it("marks the one app that stays, and only that one", () => {
    render(<Cost />);
    expect(screen.getAllByText("You keep this one")).toHaveLength(1);
    const row = screen.getByText("Google Workspace Business Standard").closest("li");
    expect(row).toHaveTextContent("You keep this one");
  });
});

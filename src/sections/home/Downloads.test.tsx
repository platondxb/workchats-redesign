import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { platforms } from "@/content/site";
import { Downloads } from "./Downloads";

describe("Downloads", () => {
  it("offers every platform as a real, pressable button, named after the platform", () => {
    render(<Downloads />);
    for (const platform of platforms) {
      const button = screen.getByRole("button", { name: new RegExp(`^${platform.label}`) });
      expect(button).toHaveAttribute("type", "button");
      // Recorded as download_click with its platform once analytics is accepted.
      expect(button).toHaveAttribute("data-download", platform.id);
    }
  });

  it("says what each platform needs", () => {
    render(<Downloads />);
    for (const platform of platforms) expect(screen.getByText(platform.detail)).toBeInTheDocument();
  });

  it("shows no release status: nothing is beta and nothing is in review", () => {
    const { container } = render(<Downloads />);
    expect(container.textContent).not.toMatch(/beta|in review/i);
  });

  it("keeps the page as it is when a platform is pressed, as the owner asked for this MVP", async () => {
    const user = userEvent.setup();
    const { container } = render(<Downloads />);
    const before = container.innerHTML;
    await user.click(screen.getByRole("button", { name: /^Windows/ }));
    await user.click(screen.getByRole("button", { name: /^Android/ }));
    expect(container.innerHTML).toBe(before);
  });

  it("marks the visitor's own platform with words, not colour alone", () => {
    const { container } = render(<Downloads />);
    // The marker is in every button and shown by CSS for the platform in <html data-os>.
    expect(container.querySelectorAll("button")).toHaveLength(platforms.length);
    expect(screen.getAllByText("This device")).toHaveLength(platforms.length);
  });

  it("names the calendars Workchats syncs with", () => {
    render(<Downloads />);
    expect(screen.getByText("Syncs with Google Calendar, Outlook and iCal.")).toBeInTheDocument();
  });
});

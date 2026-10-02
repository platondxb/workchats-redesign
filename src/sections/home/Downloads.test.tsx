import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { platforms } from "@/content/site";
import { Downloads } from "./Downloads";

describe("Downloads", () => {
  it("makes every platform a real, pressable button", () => {
    render(<Downloads />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(platforms.length);
    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
    }
  });

  it("names each button after its platform", () => {
    render(<Downloads />);
    for (const platform of platforms) {
      expect(screen.getByRole("button", { name: platform.label })).toBeInTheDocument();
    }
  });

  it("shows no release status: nothing is beta and nothing is in review", () => {
    const { container } = render(<Downloads />);
    expect(container.textContent).not.toMatch(/beta|in review/i);
  });

  it("keeps the page exactly as it is when a platform is pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<Downloads />);
    const before = container.textContent;
    await user.click(screen.getByRole("button", { name: "Windows" }));
    await user.click(screen.getByRole("button", { name: "Android" }));
    expect(container.textContent).toBe(before);
    expect(screen.getByText(/Choose a platform to see what you'll need/)).toBeInTheDocument();
  });
});

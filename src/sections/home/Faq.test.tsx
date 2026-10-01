import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { faq } from "@/content/faq";
import { Faq } from "./Faq";

describe("Faq", () => {
  it("has a heading and one disclosure per question", () => {
    const { container } = render(<Faq />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Questions? We're glad you asked." }),
    ).toBeInTheDocument();
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(faq.length);
    items.forEach((item, index) => {
      expect(item.querySelector("summary")).toHaveTextContent(faq[index]?.question ?? "");
      expect(item).not.toHaveAttribute("open");
    });
  });

  it("keeps every answer in the HTML, closed until asked for", () => {
    const { container } = render(<Faq />);
    const first = container.querySelector("details");
    expect(first).toHaveTextContent("5 GB of storage per user");
  });

  it("offers a way to ask something else", () => {
    render(<Faq />);
    expect(screen.getByRole("link", { name: "support@workchats.com" })).toHaveAttribute(
      "href",
      "mailto:support@workchats.com",
    );
  });

  it("puts every question in the keyboard tab order", async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq />);
    // The "See all questions" and support email links come first, then each question in order.
    await user.tab();
    await user.tab();
    for (const summary of container.querySelectorAll("summary")) {
      await user.tab();
      expect(summary).toHaveFocus();
    }
    // Opening with Enter/Space is native <details> behaviour; e2e/home.spec.ts checks it in a real browser.
  });
});

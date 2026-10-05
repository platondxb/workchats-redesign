import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { faq } from "@/content/faq";
import { Faq } from "./Faq";

describe("Faq", () => {
  it("has a heading and one disclosure per question", () => {
    const { container } = render(<Faq />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Questions teams ask before they switch" }),
    ).toBeInTheDocument();
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(faq.length);
    items.forEach((item, index) => {
      expect(item.querySelector("summary")).toHaveTextContent(faq[index]?.question ?? "");
      expect(item).not.toHaveAttribute("open");
      // Names the question for the faq_open event.
      expect(item).toHaveAttribute("data-faq", faq[index]?.id);
    });
  });

  it("keeps every answer in the HTML, closed until asked for", () => {
    const { container } = render(<Faq />);
    const first = container.querySelector("details");
    expect(first).toHaveTextContent("5 GB of storage per person");
  });

  it("explains moving over from the chat tool you use today", () => {
    const switching = faq.find((item) => item.id === "switching");
    expect(switching?.answer).toContain("Import your message history from the chat tool you use today");
  });

  it("answers what happens at the sixth person, with the Pro price", () => {
    expect(faq.find((item) => item.id === "sixth-person")?.answer).toContain("£3 per person a month");
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

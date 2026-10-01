import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Security } from "./Security";

describe("Security", () => {
  it("makes three short promises, each with its own heading, encryption first", () => {
    render(<Security />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "End-to-end encryption",
      "Granular privacy settings",
      "GDPR compliant",
    ]);
    expect(screen.getByText(/Even on Free/)).toBeInTheDocument();
  });

  it("names the hosting regions as a list people can read", () => {
    render(<Security />);
    const regions = screen.getByText("Hosted in your region").nextElementSibling;
    expect(regions?.tagName).toBe("UL");
    expect(regions).toHaveTextContent("United Kingdom");
    expect(regions).toHaveTextContent("European Union");
    expect(regions).toHaveTextContent("Middle East");
  });

  it("keeps the product pictures out of the accessibility tree; the text carries the facts", () => {
    const { container } = render(<Security />);
    const pictures = container.querySelectorAll("li > [aria-hidden='true']");
    expect(pictures).toHaveLength(3);
  });

  it("offers one route to a security conversation", () => {
    render(<Security />);
    expect(screen.getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", "/book-a-demo");
  });
});

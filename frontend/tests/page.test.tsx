import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the SafeDocs heading in the main landmark", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "SafeDocs" }),
    ).toBeInTheDocument();
  });

  it("shows a checking message while the API status loads", () => {
    render(<Home />);

    expect(screen.getByText("API: checking")).toBeInTheDocument();
  });
});

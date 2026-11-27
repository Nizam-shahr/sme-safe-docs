import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiStatus } from "@/components/shell/ApiStatus";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ApiStatus", () => {
  it("shows API: ok when the API is healthy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ status: "ok" })),
    );

    render(await ApiStatus());

    expect(screen.getByText("API: ok")).toBeInTheDocument();
  });

  it("shows API: unavailable when the API is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    render(await ApiStatus());

    expect(screen.getByText("API: unavailable")).toBeInTheDocument();
  });
});

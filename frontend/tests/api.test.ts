import { afterEach, describe, expect, it, vi } from "vitest";

import { getHealth } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getHealth", () => {
  it("returns ok when the API reports status ok", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ status: "ok" }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("API_BASE_URL", "http://api:8000");

    await expect(getHealth()).resolves.toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api:8000/health",
      expect.anything(),
    );
  });

  it("returns unavailable when the API answers with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("down", { status: 503 })),
    );

    await expect(getHealth()).resolves.toBe("unavailable");
  });

  it("returns unavailable when the API cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    await expect(getHealth()).resolves.toBe("unavailable");
  });
});

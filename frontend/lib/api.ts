// Typed wrapper around the FastAPI backend. Called from server code only.

export type HealthStatus = "ok" | "unavailable";

type HealthResponse = { status: string };

const HEALTH_TIMEOUT_MS = 2000;

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://localhost:8000";
}

function isHealthResponse(body: unknown): body is HealthResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof body.status === "string"
  );
}

/** Ask the API whether it is up. Never throws: any failure means "unavailable". */
export async function getHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${apiBaseUrl()}/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) return "unavailable";
    const body: unknown = await response.json();
    return isHealthResponse(body) && body.status === "ok"
      ? "ok"
      : "unavailable";
  } catch {
    // Network errors, timeouts and invalid JSON all mean the API is not usable.
    return "unavailable";
  }
}

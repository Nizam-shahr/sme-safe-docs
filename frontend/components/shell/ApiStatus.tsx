import { getHealth } from "@/lib/api";

/** Server component that shows whether the backend API is reachable. */
export async function ApiStatus() {
  const status = await getHealth();
  const tone =
    status === "ok" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger";

  return (
    <p className={`rounded-full px-3 py-1 text-sm font-medium ${tone}`}>
      API: {status}
    </p>
  );
}

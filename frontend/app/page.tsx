import { Suspense } from "react";

import { ApiStatus } from "@/components/shell/ApiStatus";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-8">
      <h1 className="text-3xl text-ink">SafeDocs</h1>
      <Suspense
        fallback={
          <p className="rounded-full bg-subtle px-3 py-1 text-sm text-ink-muted">
            API: checking
          </p>
        }
      >
        <ApiStatus />
      </Suspense>
    </main>
  );
}

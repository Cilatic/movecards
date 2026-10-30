import { LoaderCircle } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 bg-background text-foreground" role="status" aria-live="polite" aria-busy="true">
      <LoaderCircle className="h-6 w-6 motion-safe:animate-spin" aria-hidden />
      <span className="text-[1.05rem] font-semibold">Loading…</span>
    </div>
  );
}

export function NavigationFeedback() {
  const loading = useRouterState({ select: (state) => state.isLoading });
  if (!loading) return null;
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
      <span className="flex items-center gap-3 rounded-full bg-night px-5 py-3 text-base font-semibold text-night-foreground shadow-float">
        <LoaderCircle className="h-5 w-5 motion-safe:animate-spin" aria-hidden /> Loading…
      </span>
    </div>
  );
}
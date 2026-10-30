import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-store";
import { TabBar } from "./TabBar";
import { PageLoading } from "./PageLoading";

/** Wraps tab screens: needs a signed-in user or guest mode, and shows the tab bar. */
export function TabScreen({ children }: { children: ReactNode }) {
  const { status } = useApp();
  if (status === "loading") return <PageLoading />;
  if (status === "signed-out") return <Navigate to="/sign-in" replace />;
  return (
    <div className="mx-auto min-h-screen max-w-[30rem] pb-32">
      {children}
      <TabBar />
    </div>
  );
}

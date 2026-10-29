import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useApp } from "@/lib/app-store";
import { BackButton, Field, PillButton, pill } from "@/components/move/ui";
import { SignInHero } from "@/components/move/illustrations";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sign in · Move Cards" },
      { name: "description", content: "Sign in to Move Cards to see your exercise history and settings." },
      { property: "og:title", content: "Sign in · Move Cards" },
      { property: "og:description", content: "Gentle exercise cards for older adults and carers." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { status, continueAsGuest } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "signed-in" || status === "guest") return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error("That email or password didn't work. Please try again.");
    else navigate({ to: "/" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in didn't work. Please try again.");
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-[30rem] flex-col pb-8">
      <div className="absolute left-6 top-8 z-10"><BackButton /></div>
      <SignInHero />
      <div className="flex flex-1 flex-col px-6">
        <h1 className="text-title mt-2">Welcome back</h1>
        <p className="mt-2 text-[1.05rem] text-muted-foreground">Sign in to see your history and settings.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field id="email" label="Email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="password" label="Password" type="password" autoComplete="current-password" required placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PillButton type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</PillButton>
        </form>
        <PillButton variant="dark" className="mt-3" onClick={google} type="button">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm font-extrabold text-foreground">G</span>
          Continue with Google
        </PillButton>
        <div className="mt-5 flex items-start justify-between gap-4 text-base font-bold">
          <Link to="/forgot-password" className="inline-flex min-h-12 items-center underline underline-offset-4">
            Forgot password?
          </Link>
          <button type="button" onClick={continueAsGuest} className="inline-flex min-h-12 items-center text-right text-primary underline underline-offset-4">
            Continue without signing in
          </button>
        </div>
        <div className="mt-auto pt-8">
          <Link to="/create-account" className={pill({ variant: "white" })}>Create an account</Link>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import type { Mode } from "@/lib/data/exercises";
import { BackButton, Field, PictureCard, PillButton } from "@/components/move/ui";
import { HelpingAvatar, MeAvatar } from "@/components/move/illustrations";

export const Route = createFileRoute("/create-account")({
  head: () => ({
    meta: [
      { title: "Create account · Move Cards" },
      { name: "description", content: "Create a Move Cards account to save your exercises and settings." },
      { property: "og:title", content: "Create account · Move Cards" },
      { property: "og:description", content: "Save your gentle exercise history across devices." },
    ],
  }),
  component: CreateAccount,
});

function CreateAccount() {
  const { status } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("me");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (status === "signed-in") return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Please use at least 8 characters for your password."); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name, mode } },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (!data.session) setSent(true);
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-[30rem] flex-col overflow-hidden px-6 pb-8 pt-8">
      <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blush" />
      <div aria-hidden className="absolute right-12 top-14 h-6 w-6 rounded-full bg-mustard" />
      <div className="relative"><BackButton to="/sign-in" /></div>
      <h1 className="text-title relative mt-6">Create account</h1>

      {sent ? (
        <div className="mt-6 rounded-card bg-card p-6 shadow-soft">
          <h2 className="text-section">Check your email</h2>
          <p className="mt-2 text-[1.05rem]">We sent a link to <strong>{email}</strong>. Tap it to finish creating your account.</p>
          <Link to="/sign-in" className="mt-4 inline-flex min-h-12 items-center font-bold text-primary underline underline-offset-4">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col">
          <div className="space-y-4">
            <Field id="name" label="Your name" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <Field id="email" label="Email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Field id="password" label="Password" type="password" required placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <h2 className="text-section mt-6">Who will use the app?</h2>
          <div role="radiogroup" aria-label="Who will use the app?" className="mt-3 flex gap-4">
            <PictureCard label="Me" selected={mode === "me"} onClick={() => setMode("me")}><MeAvatar /></PictureCard>
            <PictureCard label="Helping someone" selected={mode === "helping"} onClick={() => setMode("helping")}><HelpingAvatar /></PictureCard>
          </div>
          <div className="mt-auto space-y-3 pt-8">
            <PillButton type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</PillButton>
            <Link to="/sign-in" className="flex min-h-12 items-center justify-center text-base font-bold underline underline-offset-4">I already have an account</Link>
          </div>
        </form>
      )}
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackButton, Field, PillButton } from "@/components/move/ui";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password · Move Cards" },
      { name: "description", content: "Get a link to reset your Move Cards password." },
      { property: "og:title", content: "Forgot password · Move Cards" },
      { property: "og:description", content: "Reset your Move Cards password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message);
    else setSent(true);
  }
  return (
    <main className="mx-auto min-h-screen max-w-[30rem] px-6 pt-8">
      <BackButton to="/sign-in" />
      <h1 className="text-title mt-6">Forgot password?</h1>
      {sent ? (
        <p className="mt-4 text-[1.05rem]">If there's an account for <strong>{email}</strong>, we've sent a link to set a new password.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-5">
          <p className="text-[1.05rem] text-muted-foreground">Enter your email and we'll send you a link.</p>
          <Field id="email" label="Email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PillButton type="submit">Send link</PillButton>
        </form>
      )}
    </main>
  );
}

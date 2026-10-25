import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Field, PillButton } from "@/components/move/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password · Move Cards" },
      { name: "description", content: "Choose a new password for Move Cards." },
      { property: "og:title", content: "Set a new password · Move Cards" },
      { property: "og:description", content: "Choose a new password for Move Cards." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Please use at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); return; }
    toast.success("Your password has been changed.");
    navigate({ to: "/" });
  }
  return (
    <main className="mx-auto min-h-screen max-w-[30rem] px-6 pt-12">
      <h1 className="text-title">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Field id="password" label="New password" type="password" required placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <PillButton type="submit">Save password</PillButton>
      </form>
    </main>
  );
}

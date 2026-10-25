import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/move/ui";

export const Route = createFileRoute("/how-to-use")({
  head: () => ({
    meta: [
      { title: "How to use the cards · Move Cards" },
      { name: "description", content: "Pick a card, scan the QR code, follow the steps." },
      { property: "og:title", content: "How to use the cards · Move Cards" },
      { property: "og:description", content: "Pick, scan, move." },
    ],
  }),
  component: () => (
    <main className="mx-auto max-w-[30rem] px-6 pt-8">
      <BackButton />
      <h1 className="text-title mt-6">How to use the cards</h1>
      <p className="mt-2 text-[1.05rem] text-muted-foreground">Full guide arrives in stage 4.</p>
    </main>
  ),
});

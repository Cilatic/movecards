import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/move/ComingSoon";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · Move Cards" },
      { name: "description", content: "See the exercises you've done this week." },
      { property: "og:title", content: "History · Move Cards" },
      { property: "og:description", content: "See the exercises you've done this week." },
    ],
  }),
  component: () => <ComingSoon title="History" note="Arrives in stage 4." />,
});

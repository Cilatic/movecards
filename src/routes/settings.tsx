import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/move/ComingSoon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Move Cards" },
      { name: "description", content: "Text size, contrast, voice speed and more." },
      { property: "og:title", content: "Settings · Move Cards" },
      { property: "og:description", content: "Text size, contrast, voice speed and more." },
    ],
  }),
  component: () => <ComingSoon title="Settings" note="Arrives in stage 4." />,
});

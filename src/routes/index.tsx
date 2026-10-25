import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/move/ComingSoon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Move Cards – gentle exercises for every day" },
      { name: "description", content: "Companion app for the Move Cards deck: 35 gentle exercises for older adults and carers." },
      { property: "og:title", content: "Move Cards – gentle exercises for every day" },
      { property: "og:description", content: "Scan a card, follow the steps, mark it as done." },
    ],
  }),
  component: () => <ComingSoon title="Home" note="The home screen arrives in stage 2." />,
});

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/move/ComingSoon";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Exercises · Move Cards" },
      { name: "description", content: "35 gentle exercises in 5 areas: Strength, Flexibility, Heart, Balance and Mind." },
      { property: "og:title", content: "Exercises · Move Cards" },
      { property: "og:description", content: "35 gentle exercises in 5 areas." },
    ],
  }),
  component: () => <ComingSoon title="Exercises" note="35 exercises in 5 areas. Arrives in stage 2." />,
});

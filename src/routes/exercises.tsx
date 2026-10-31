import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { doneExerciseIds } from "@/lib/stats";
import { useContent } from "@/lib/content";
import { TabScreen } from "@/components/move/AppGate";
import { AreaFigure } from "@/components/move/AreaFigure";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/move/ui";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Exercises · Move Cards" },
      { name: "description", content: "35 gentle exercises in 5 areas: Strength, Flexibility, Heart, Balance and Mind." },
      { property: "og:title", content: "Exercises · Move Cards" },
      { property: "og:description", content: "35 gentle exercises in 5 areas." },
    ],
  }),
  component: () => (
    <TabScreen>
      <Exercises />
    </TabScreen>
  ),
});

const BG: Record<string, string> = {
  strength: "bg-strength text-night-foreground",
  flexibility: "bg-flexibility text-foreground",
  heart: "bg-heart text-night-foreground",
  balance: "bg-balance text-night-foreground",
  mind: "bg-mind text-night-foreground",
};

function Exercises() {
  const { completions, settings } = useApp();
  const { areas, exercisesInArea } = useContent();
  const done = doneExerciseIds(completions.filter((c) => c.mode === settings.mode));
  return (
    <main className="px-5 pt-8">
      <div className="mb-6"><BackButton /></div>
      <h1 className="text-title">Exercises</h1>
      <p className="mt-1 text-[1.05rem] text-muted-foreground">35 exercises in 5 areas</p>
      <ul className="mt-6 grid grid-cols-2 gap-4">
        {areas.map((a) => {
          const list = exercisesInArea(a.id);
          const n = list.filter((e) => done.has(e.id)).length;
          const wide = a.id === "mind";
          return (
            <li key={a.id} className={cn(wide && "col-span-2")}>
              <Link
                to="/area/$areaId"
                params={{ areaId: a.id }}
                className={cn("relative flex min-h-52 flex-col overflow-hidden rounded-card p-5", BG[a.id], wide && "min-h-40")}
              >
                <div aria-hidden className="absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-night-foreground/15" />
                <AreaFigure pose={a.pose} className={cn("absolute bottom-1 right-1 h-28 w-24", wide && "h-32 w-28")} />
                <h2 className="relative text-[1.3rem] font-extrabold">{a.name}</h2>
                <span className="relative mt-1 w-fit rounded-full bg-night/25 px-3 py-0.5 text-sm font-bold">7 exercises</span>
                <span className="relative mt-auto w-fit rounded-full bg-card px-3 py-1 text-sm font-bold text-foreground">
                  {n}/{list.length} done
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

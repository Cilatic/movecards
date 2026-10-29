import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { exercisesInArea, getArea, type AreaId } from "@/lib/data/exercises";
import { useApp } from "@/lib/app-store";
import { doneExerciseIds } from "@/lib/stats";
import { BackButton } from "@/components/move/ui";
import { AreaFigure } from "@/components/move/AreaFigure";
import { AREA_BG } from "@/components/move/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/area/$areaId")({
  loader: ({ params }) => {
    const area = getArea(params.areaId);
    if (!area) throw notFound();
    return { id: area.id, name: area.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: `${loaderData?.name ?? "Area"} exercises · Move Cards` },
      { name: "description", content: `7 gentle ${loaderData?.name ?? ""} exercises from the Move Cards deck.` },
      { property: "og:title", content: `${loaderData?.name ?? "Area"} · Move Cards` },
      { property: "og:description", content: "7 gentle exercises from the Move Cards deck." },
    ],
  }),
  component: AreaPage,
});

function AreaPage() {
  const { id, name } = Route.useLoaderData();
  const area = getArea(id)!;
  const list = exercisesInArea(id as AreaId);
  const { completions, settings } = useApp();
  const done = doneExerciseIds(completions.filter((c) => c.mode === settings.mode));
  const n = list.filter((e) => done.has(e.id)).length;

  return (
    <main className="mx-auto min-h-screen max-w-[30rem] pb-10">
      <header className={cn("relative overflow-hidden rounded-b-[2.5rem] px-6 pb-8 pt-8", AREA_BG[area.id])}>
        <div aria-hidden className="absolute -bottom-12 -right-10 h-52 w-52 rounded-full bg-night-foreground/15" />
        <AreaFigure pose={area.pose} className="absolute bottom-0 right-4 h-40 w-36" />
        <div className="relative"><BackButton to="/exercises" /></div>
        <h1 className="text-title relative mt-6">{name}</h1>
        <p className="relative mt-1 text-[1.05rem] font-semibold">{n} of 7 done</p>
      </header>
      <ol className="mt-6 space-y-3 px-5">
        {list.map((e) => {
          const isDone = done.has(e.id);
          return (
            <li key={e.id}>
              <Link to="/exercise/$id" params={{ id: e.id }} className="flex min-h-20 items-center gap-4 rounded-card bg-card p-4 shadow-soft">
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold", isDone ? "bg-balance text-night-foreground" : "bg-beige")}>
                  {isDone ? <Check className="h-6 w-6" strokeWidth={3} aria-label="Done" /> : e.cardNumber}
                </span>
                <span className="flex-1">
                  <span className="block text-[1.05rem] font-bold leading-tight">{e.name}</span>
                  <span className="block text-[0.95rem] text-muted-foreground">{e.subArea} · {e.duration}</span>
                </span>
                <ChevronRight className="h-6 w-6" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

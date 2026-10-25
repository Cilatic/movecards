import { createFileRoute, notFound } from "@tanstack/react-router";
import { getArea } from "@/lib/data/exercises";
import { BackButton } from "@/components/move/ui";

export const Route = createFileRoute("/area/$areaId")({
  loader: ({ params }) => {
    const area = getArea(params.areaId);
    if (!area) throw notFound();
    return { name: area.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Area"} exercises · Move Cards` },
      { name: "description", content: `7 gentle ${loaderData?.name ?? ""} exercises.` },
      { property: "og:title", content: `${loaderData?.name ?? "Area"} · Move Cards` },
      { property: "og:description", content: "7 gentle exercises from the Move Cards deck." },
    ],
  }),
  component: AreaPage,
});

function AreaPage() {
  const { name } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-[30rem] px-6 pt-8">
      <BackButton to="/exercises" />
      <h1 className="text-title mt-6">{name}</h1>
      <p className="mt-2 text-[1.05rem] text-muted-foreground">The exercise list arrives in stage 3.</p>
    </main>
  );
}

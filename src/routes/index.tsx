import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Flame, Users, User } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { weekStats } from "@/lib/stats";
import type { Mode } from "@/lib/data/exercises";
import { TabScreen } from "@/components/move/AppGate";
import { PillSwitch, pill } from "@/components/move/ui";
import { Logo } from "@/components/move/illustrations";
import { AreaFigure } from "@/components/move/AreaFigure";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PillButton } from "@/components/move/ui";
import { WeeklyGoalDialog } from "@/components/move/WeeklyGoal";
import { goalProgress } from "@/lib/weekly-goal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Move Cards – gentle exercises for every day" },
      { name: "description", content: "Companion app for the Move Cards deck: 35 gentle exercises for older adults and carers." },
      { property: "og:title", content: "Move Cards – gentle exercises for every day" },
      { property: "og:description", content: "Scan a card, follow the steps, mark it as done." },
    ],
  }),
  component: () => (
    <TabScreen>
      <Home />
    </TabScreen>
  ),
});

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function Home() {
  const { settings, completions, updateSettings } = useApp();
  const helping = settings.mode === "helping";
  const stats = weekStats(completions.filter((c) => c.mode === settings.mode));
  const ring = 2 * Math.PI * 34;
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <main>
      <header className="relative overflow-hidden rounded-b-[2.5rem] bg-night px-6 pb-24 pt-8 text-night-foreground">
        <div aria-hidden className="absolute -right-16 -top-20 h-56 w-48 rotate-[-25deg] rounded-[45%] bg-strength" />
        <div aria-hidden className="absolute right-0 top-36 h-9 w-9 translate-x-1/3 rounded-full bg-mustard" />
        <div aria-hidden className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full border-2 border-night-foreground/15" />
        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-bold"><Logo /> Move Cards</span>
          <Link to="/how-to-use" aria-label="How to use the cards" className="flex h-14 w-14 items-center justify-center rounded-full bg-night-foreground/20 text-2xl font-extrabold">?</Link>
        </div>
        <h1 className="text-title relative mt-6">Hello{settings.name ? `, ${settings.name}` : ""}!</h1>
        <div className="relative mt-5">
          <PillSwitch<Mode>
            label="Who is using the app"
            onDark
            value={settings.mode}
            onChange={(m) => void updateSettings({ mode: m })}
            options={[
              { value: "me", label: "Me", icon: <User className="h-5 w-5" /> },
              { value: "helping", label: "Helping someone", icon: <Users className="h-5 w-5" /> },
            ]}
          />
        </div>
      </header>

      <div className="relative -mt-16 space-y-4 px-5">
        <section aria-label="This week" className="rounded-card bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <PillButton variant="white" aria-label={`Change weekly goal, ${stats.daysDone} of ${settings.weeklyGoal} days`} onClick={() => setGoalOpen(true)} className="relative h-24 w-24 shrink-0 rounded-full p-0 shadow-none">
              <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
                <circle cx="40" cy="40" r="34" className="fill-none stroke-blush" strokeWidth="9" />
                <circle cx="40" cy="40" r="34" className="fill-none stroke-strength" strokeWidth="9" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - goalProgress(stats.daysDone, settings.weeklyGoal))} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-2xl font-extrabold">{stats.daysDone}</span>
                <span className="text-[0.75rem] font-semibold">of {settings.weeklyGoal} {settings.weeklyGoal === 1 ? "day" : "days"}</span>
              </div>
            </PillButton>
            <div className="flex-1">
              <p className="text-2xl font-extrabold">{stats.exercisesThisWeek}</p>
              <p className="text-[0.95rem] leading-tight text-muted-foreground">exercises this week</p>
            </div>
            <div className="flex-1">
              <p className="flex items-center gap-1 text-2xl font-extrabold"><Flame className="h-5 w-5 text-primary" aria-hidden />{stats.streak}</p>
              <p className="text-[0.95rem] leading-tight text-muted-foreground">day streak</p>
            </div>
          </div>
          <ol className="mt-4 flex justify-between">
            {stats.days.map((d, i) => (
              <li key={i} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    d.done ? "bg-strength text-night-foreground" : "bg-beige",
                    d.isToday && "outline-[3px] outline-offset-2 outline-night outline-solid",
                  )}
                >
                  {d.done && <Check className="h-5 w-5" strokeWidth={3} />}
                  <span className="sr-only">{d.date.toLocaleDateString(undefined, { weekday: "long" })}: {d.done ? "done" : "not done"}{d.isToday ? " (today)" : ""}</span>
                </span>
                <span aria-hidden className="text-sm font-bold">{LETTERS[i]}</span>
              </li>
            ))}
          </ol>
        </section>

        {helping && (
          <div role="status" className="rounded-card bg-helper p-5 text-night-foreground">
            <p className="text-[1.05rem] font-bold">Helping mode is on</p>
            <p className="text-[0.95rem]">Exercises show where to stand and how to guide.</p>
          </div>
        )}

        <Link to="/exercises" className="relative block overflow-hidden rounded-card bg-strength p-6 text-night-foreground">
          <div aria-hidden className="absolute -bottom-14 -right-10 h-56 w-56 rounded-full bg-night-foreground/15" />
          <div aria-hidden className="absolute right-1/3 top-5 h-5 w-5 rounded-full bg-mustard" />
          <AreaFigure pose="chair-stand" className="absolute bottom-0 right-2 h-40 w-36" />
          <div className="relative max-w-[60%]">
            <h2 className="text-[1.7rem] font-extrabold leading-tight">Browse exercises</h2>
            <span className="mt-2 inline-block rounded-full bg-card px-3 py-1 text-sm font-bold text-foreground">35 exercises · 5 areas</span>
            <span className={cn(pill({ variant: "dark" }), "mt-5 w-auto")}>Let's go <ChevronRight className="h-5 w-5" /></span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/history" className="relative min-h-44 overflow-hidden rounded-card bg-balance p-5 text-night-foreground">
            <h2 className="text-[1.25rem] font-extrabold leading-tight">{helping ? "Their history" : "My history"}</h2>
            <p className="mt-1 text-[0.95rem]">{helping ? "This week" : "What you did this week"}</p>
            <div aria-hidden className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-night-foreground/15" />
            <div aria-hidden className="absolute bottom-4 right-4 flex items-end gap-1.5">
              <span className="h-7 w-3.5 rounded-full bg-background" />
              <span className="h-11 w-3.5 rounded-full bg-mustard" />
              <span className="h-8 w-3.5 rounded-full bg-background" />
              <span className="h-14 w-3.5 rounded-full bg-strength" />
            </div>
          </Link>
          <div className="min-h-44 rounded-card border-2 border-dashed border-border p-5">
            <h2 className="text-[1.25rem] font-extrabold leading-tight text-muted-foreground">{helping ? "Their plan" : "My plan"}</h2>
            <span className="mt-2 inline-block rounded-full bg-blush px-3 py-1 text-sm font-bold text-warning-foreground">Coming soon</span>
          </div>
        </div>

        <Link to="/how-to-use" className="flex min-h-20 items-center gap-4 rounded-card bg-card p-5 shadow-soft">
          <span aria-hidden className="relative h-12 w-14 shrink-0">
            <span className="absolute left-0 top-1 h-11 w-8 -rotate-12 rounded-md bg-balance" />
            <span className="absolute left-3 top-0 h-11 w-8 rounded-md bg-mustard" />
            <span className="absolute left-6 top-1 h-11 w-8 rotate-12 rounded-md bg-strength" />
          </span>
          <span className="flex-1">
            <span className="block text-[1.05rem] font-bold">How to use the cards</span>
            <span className="block text-[0.95rem] text-muted-foreground">Pick, scan, move</span>
          </span>
          <ChevronRight className="h-6 w-6" aria-hidden />
        </Link>
      </div>
      {goalOpen && <WeeklyGoalDialog onClose={() => setGoalOpen(false)} />}
    </main>
  );
}

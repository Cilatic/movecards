import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MoreVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp, type Completion } from "@/lib/app-store";
import { dayKey, weekStats } from "@/lib/stats";
import { getArea, getExercise, type Version } from "@/lib/data/exercises";
import { TabScreen } from "@/components/move/AppGate";
import { BackButton, PillButton, pill } from "@/components/move/ui";
import { WeeklyGoalDialog } from "@/components/move/WeeklyGoal";
import { goalProgress } from "@/lib/weekly-goal";
import { AREA_BG, Bars, ClearHistoryDialog, VERSION_LABEL } from "@/components/move/shared";
import { AreaFigure } from "@/components/move/AreaFigure";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "History · Move Cards" },
      { name: "description", content: "See the exercises you've done this week." },
      { property: "og:title", content: "History · Move Cards" },
      { property: "og:description", content: "See the exercises you've done this week." },
    ],
  }),
  component: () => (
    <TabScreen>
      <History />
    </TabScreen>
  ),
});

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function History() {
  const { completions, settings, clearHistory } = useApp();
  const mine = completions.filter((c) => c.mode === settings.mode);
  const stats = weekStats(mine);
  const [selected, setSelected] = useState(() => dayKey(new Date()));
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pickMode, setPickMode] = useState<"edit" | "delete" | null>(null);
  const [editing, setEditing] = useState<Completion | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);

  const selDate = stats.days.find((d) => dayKey(d.date) === selected)?.date ?? new Date();
  const entries = useMemo(() => mine.filter((c) => dayKey(new Date(c.doneAt)) === selected), [mine, selected]);

  return (
    <main className="px-5 pt-8">
      <div className="mb-6"><BackButton /></div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-title">History</h1>
          <p className="mt-1 text-[1.05rem] text-muted-foreground">This week</p>
        </div>
        <div className="relative">
          <button type="button" aria-label="History options" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <MoreVertical className="h-6 w-6" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-3xl bg-card py-2 shadow-float">
              <MenuItem onClick={() => { setMenu(false); setPickMode("edit"); }}>Edit an entry</MenuItem>
              <MenuItem onClick={() => { setMenu(false); setPickMode("delete"); }}>Delete an entry</MenuItem>
              <MenuItem danger onClick={() => { setMenu(false); setConfirm(true); }}>Clear all history</MenuItem>
            </div>
          )}
        </div>
      </div>

      <section aria-label="Week" className="mt-5 rounded-card bg-night p-5 text-night-foreground">
        <ol className="flex justify-between">
          {stats.days.map((d, i) => {
            const k = dayKey(d.date);
            const sel = k === selected;
            return (
              <li key={k} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelected(k)}
                  aria-pressed={sel}
                  aria-label={`${d.date.toLocaleDateString(undefined, { weekday: "long" })}${d.done ? ", done" : ""}`}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    d.done ? "bg-strength" : "bg-night-soft",
                    sel && "outline-[3px] outline-offset-2 outline-mustard outline-solid",
                  )}
                >
                  {d.done && <Check className="h-5 w-5" strokeWidth={3} />}
                </button>
                <span aria-hidden className="text-sm font-bold">{LETTERS[i]}</span>
              </li>
            );
          })}
        </ol>
        <PillButton variant="dark" onClick={() => setGoalOpen(true)} aria-label={`Change weekly goal, ${stats.daysDone} of ${settings.weeklyGoal} days`} className="mt-5 block rounded-xl bg-transparent p-0 text-left font-normal hover:bg-transparent">
          <span className="flex flex-wrap justify-between gap-2 text-[0.95rem]"><span className="font-bold">Weekly goal</span><span>{stats.daysDone} of {settings.weeklyGoal} {settings.weeklyGoal === 1 ? "day" : "days"}</span></span>
          <span className="mt-2 block h-3 overflow-hidden rounded-full bg-night-soft">
            <span className="block h-full rounded-full bg-mustard" style={{ width: `${goalProgress(stats.daysDone, settings.weeklyGoal) * 100}%` }} />
          </span>
        </PillButton>
      </section>

      {pickMode && (
        <div role="status" className="mt-4 flex items-center justify-between rounded-2xl bg-mustard/30 p-3 text-[1rem] font-semibold">
          Tap an entry to {pickMode} it.
          <button type="button" className="min-h-12 px-3 font-bold underline" onClick={() => setPickMode(null)}>Cancel</button>
        </div>
      )}

      <h2 className="text-section mt-6">{selDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2>
      {entries.length === 0 ? (
        <div className="mt-3 rounded-card bg-card p-6 text-center shadow-soft">
          <p className="text-[1.05rem] font-semibold">Nothing yet. Try an exercise!</p>
          <Link to="/exercises" className={cn(pill(), "mt-4")}>Browse exercises</Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map((c) => (
            <Entry key={c.id} c={c} pickMode={pickMode} onEdit={() => { setPickMode(null); setEditing(c); }} onPicked={() => setPickMode(null)} />
          ))}
        </ul>
      )}

      {confirm && <ClearHistoryDialog onClose={() => setConfirm(false)} onConfirm={async () => { await clearHistory(); toast.success("History cleared."); }} />}
      {editing && <EditDialog c={editing} onClose={() => setEditing(null)} />}
      {goalOpen && <WeeklyGoalDialog onClose={() => setGoalOpen(false)} />}
    </main>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={cn("flex min-h-14 w-full items-center px-5 text-left text-[1.05rem] font-bold hover:bg-blush", danger && "text-destructive")}>
      {children}
    </button>
  );
}

function Entry({ c, pickMode, onEdit, onPicked }: { c: Completion; pickMode: "edit" | "delete" | null; onEdit: () => void; onPicked: () => void }) {
  const { deleteCompletion } = useApp();
  const [open, setOpen] = useState(false);
  const ex = getExercise(c.exerciseId);
  const area = ex ? getArea(ex.area) : undefined;
  const del = async () => { await deleteCompletion(c.id); toast.success("Entry deleted."); };
  const body = (
    <>
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl", area ? AREA_BG[area.id] : "bg-beige")}>
        {area && <AreaFigure pose={area.pose} className="h-11 w-11" />}
      </span>
      <span className="flex-1 text-left">
        <span className="block text-[1.05rem] font-bold leading-tight">{ex?.name ?? "Exercise"}</span>
        <span className="block text-[0.95rem] text-muted-foreground">{area?.name} · {VERSION_LABEL[c.version]}</span>
      </span>
    </>
  );
  return (
    <li className="relative">
      {pickMode ? (
        <button type="button" className="flex min-h-20 w-full items-center gap-4 rounded-card bg-card p-4 shadow-soft outline-2 outline-dashed outline-night" onClick={() => { onPicked(); pickMode === "edit" ? onEdit() : void del(); }}>
          {body}
        </button>
      ) : (
        <div className="flex min-h-20 items-center gap-4 rounded-card bg-card p-4 shadow-soft">
          {body}
          <button type="button" aria-label={`Options for ${ex?.name}`} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-beige">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      )}
      {open && (
        <div role="menu" className="absolute right-2 top-full z-20 mt-1 w-48 overflow-hidden rounded-3xl bg-card py-2 shadow-float">
          <MenuItem onClick={() => { setOpen(false); onEdit(); }}>Edit</MenuItem>
          <MenuItem danger onClick={() => { setOpen(false); void del(); }}>Delete</MenuItem>
        </div>
      )}
    </li>
  );
}

function EditDialog({ c, onClose }: { c: Completion; onClose: () => void }) {
  const { updateCompletion } = useApp();
  const [version, setVersion] = useState<Version>(c.version);
  const d = new Date(c.doneAt);
  const [day, setDay] = useState(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  async function save() {
    const [y, m, dd] = day.split("-").map(Number);
    const next = new Date(d);
    next.setFullYear(y!, m! - 1, dd!);
    await updateCompletion(c.id, { version, doneAt: next.toISOString() });
    toast.success("Entry updated.");
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <div className="w-full max-w-[28rem] rounded-card bg-background p-6 shadow-float">
        <h2 id="edit-title" className="text-section">Edit entry</h2>
        <p className="text-[0.95rem] text-muted-foreground">{getExercise(c.exerciseId)?.name}</p>
        <div role="radiogroup" aria-label="Version done" className="mt-4 flex gap-3">
          {(["easier", "standard", "harder"] as Version[]).map((v, i) => (
            <button key={v} type="button" role="radio" aria-checked={version === v} onClick={() => setVersion(v)}
              className={cn("flex min-h-24 flex-1 flex-col items-center justify-center gap-2 rounded-card p-3 font-bold", version === v ? "bg-blush outline-[3px] outline-night outline-solid" : "bg-card shadow-soft")}>
              <Bars n={(i + 1) as 1 | 2 | 3} active={version === v} />
              {VERSION_LABEL[v]}
            </button>
          ))}
        </div>
        <label htmlFor="edit-day" className="mt-4 block text-[1.05rem] font-bold">Day</label>
        <input id="edit-day" type="date" value={day} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDay(e.target.value)} className="field contrast-border mt-2" />
        <div className="mt-6 space-y-2">
          <PillButton onClick={save}>Save changes</PillButton>
          <button type="button" onClick={onClose} className="flex min-h-12 w-full items-center justify-center font-bold underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}

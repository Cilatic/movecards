import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Maximize2, Plus, Save, Send, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/app-store";
import { AREAS, EXERCISES, type Exercise, type Step } from "@/lib/data/exercises";
import { areaKey, exerciseKey, mergeContent, PREVIEW_MESSAGE, type ContentMap } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editor")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Content editor · Move Cards" },
      { name: "description", content: "Edit Move Cards exercises and areas with a live preview." },
      { property: "og:title", content: "Content editor · Move Cards" },
      { property: "og:description", content: "Edit Move Cards exercises and areas with a live preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorGate,
});

function EditorGate() {
  const { status } = useApp();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", status],
    enabled: status === "signed-in",
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });
  if (status === "loading" || (status === "signed-in" && isLoading)) return <Center>Loading…</Center>;
  if (status !== "signed-in")
    return <Center>Please <Link to="/sign-in" className="font-bold text-primary underline">sign in</Link> with an editor account.</Center>;
  if (!isAdmin) return <Center>This account can't edit content. Ask the app owner for editor access.</Center>;
  return <Editor />;
}

function Center({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center p-6 text-center text-lg">{children}</main>;
}

type View = "split" | "full" | "hidden";
type Row = { key: string; draft: unknown; published: unknown };

function Editor() {
  const qc = useQueryClient();
  const { data: rows } = useQuery({
    queryKey: ["content", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_entries").select("key, draft, published");
      if (error) throw error;
      return data as Row[];
    },
  });
  const [edits, setEdits] = useState<ContentMap>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string>(EXERCISES[0]!.id);
  const [view, setView] = useState<View>("split");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!rows) return;
    const m: ContentMap = {};
    for (const r of rows) m[r.key] = r.draft ?? r.published;
    setEdits(m);
    setDirty(new Set());
  }, [rows]);

  const merged = useMemo(() => mergeContent(edits), [edits]);
  const ex = merged.getExercise(selected)!;
  const area = merged.getArea(ex.area)!;
  const unpublished = rows?.some((r) => JSON.stringify(r.draft) !== JSON.stringify(r.published)) || dirty.size > 0;

  const patchExercise = (p: Partial<Exercise>) => {
    const key = exerciseKey(ex.id);
    const { id: _i, area: _a, cardNumber: _c, ...rest } = { ...ex, ...p };
    setEdits((e) => ({ ...e, [key]: rest }));
    setDirty((d) => new Set(d).add(key));
  };
  const patchArea = (name: string) => {
    const key = areaKey(area.id);
    setEdits((e) => ({ ...e, [key]: { name } }));
    setDirty((d) => new Set(d).add(key));
  };

  async function save(publish: boolean) {
    setBusy(true);
    try {
      const keys = new Set(dirty);
      if (publish) rows?.forEach((r) => keys.add(r.key));
      const payload = [...keys].map((key) => ({
        key,
        draft: edits[key] as never,
        ...(publish ? { published: edits[key] as never } : {}),
        updated_at: new Date().toISOString(),
      }));
      if (payload.length) {
        const { error } = await supabase.from("content_entries").upsert(payload);
        if (error) throw error;
      }
      await qc.invalidateQueries({ queryKey: ["content"] });
      toast.success(publish ? "Published. Everyone now sees these changes." : "Draft saved. Only you can see it here.");
    } catch {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const btn = "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-[0.95rem] font-semibold";
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-extrabold">Move Cards Editor</Link>
          {unpublished && <span className="rounded-full bg-blush px-3 py-1 text-sm font-semibold">Unpublished changes</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {view === "split" ? (
            <button type="button" className={btn} onClick={() => setView("hidden")}><EyeOff className="h-4 w-4" /> Hide Preview</button>
          ) : (
            <button type="button" className={btn} onClick={() => setView("split")}><Eye className="h-4 w-4" /> Split Preview</button>
          )}
          {view !== "full" && <button type="button" className={btn} onClick={() => setView("full")}><Maximize2 className="h-4 w-4" /> Full Preview</button>}
          <button type="button" className={btn} disabled={busy} onClick={() => void save(false)}><Save className="h-4 w-4" /> Save Draft</button>
          <button type="button" className={cn(btn, "border-night bg-night text-night-foreground")} disabled={busy} onClick={() => void save(true)}><Send className="h-4 w-4" /> Publish</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {view !== "full" && (
          <>
            <nav aria-label="Exercises" className="w-60 shrink-0 overflow-y-auto border-r border-border bg-card p-3">
              {merged.areas.map((a) => (
                <div key={a.id} className="mb-3">
                  <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{a.name}</p>
                  {merged.exercisesInArea(a.id).map((e) => (
                    <button key={e.id} type="button" onClick={() => setSelected(e.id)}
                      className={cn("block w-full truncate rounded-lg px-2 py-2 text-left text-[0.9rem]", e.id === selected ? "bg-night font-semibold text-night-foreground" : "hover:bg-blush")}>
                      {e.cardNumber}. {e.name}{dirty.has(exerciseKey(e.id)) ? " •" : ""}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <section className={cn("min-w-0 overflow-y-auto p-6", view === "split" ? "w-1/2 flex-1" : "flex-1")}>
              <ExerciseForm key={ex.id} ex={ex} areaName={area.name} onChange={patchExercise} onAreaName={patchArea} />
            </section>
          </>
        )}
        {view !== "hidden" && (
          <section className={cn("relative flex min-w-0 justify-center overflow-hidden bg-beige p-4", view === "full" ? "flex-1" : "w-[28rem] shrink-0 border-l border-border")}>
            {view === "full" && (
              <button type="button" className={cn(btn, "absolute right-4 top-4 z-10")} onClick={() => setView("split")}><X className="h-4 w-4" /> Back to editing</button>
            )}
            <Preview exerciseId={ex.id} content={edits} />
          </section>
        )}
      </div>
    </div>
  );
}

function Preview({ exerciseId, content }: { exerciseId: string; content: ContentMap }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const send = useCallback(() => {
    ref.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, content }, window.location.origin);
  }, [content]);
  useEffect(send, [send]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === `${PREVIEW_MESSAGE}-ready`) send();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [send]);
  return (
    <iframe ref={ref} title="Live preview" src={`/exercise/${exerciseId}`}
      className="h-full w-[390px] max-w-full rounded-[1.5rem] border-4 border-night bg-background shadow-float" />
  );
}

/* ---------- form ---------- */

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, multi }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean }) {
  const cls = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[0.95rem]";
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.9rem] font-semibold">{label}</span>
      {multi ? <textarea rows={2} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function ListField({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <span className="mb-1.5 block text-[0.9rem] font-semibold">{label}</span>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-2.5 w-5 text-right text-sm text-muted-foreground">{i + 1}.</span>
            <textarea rows={1} aria-label={`${label} ${i + 1}`} className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-[0.95rem]"
              value={t} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label="Remove" className="rounded-lg px-2 text-muted-foreground hover:text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary" onClick={() => onChange([...items, ""])}>
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

const toSteps = (texts: string[], prev: Step[]): Step[] =>
  texts.map((text, i) => ({ diagram: prev[i]?.diagram ?? null, diagramLabel: prev[i]?.diagramLabel ?? `step ${i + 1}`, text }));

function ExerciseForm({ ex, areaName, onChange, onAreaName }: { ex: Exercise; areaName: string; onChange: (p: Partial<Exercise>) => void; onAreaName: (n: string) => void }) {
  const [tab, setTab] = useState<"do" | "help" | "area">("do");
  const h = ex.helping;
  const tabs = [["do", "Do it side"], ["help", "Helping side"], ["area", "Area"]] as const;
  return (
    <div className="mx-auto max-w-3xl">
      <div role="tablist" className="mb-5 inline-flex rounded-xl bg-beige p-1">
        {tabs.map(([v, l]) => (
          <button key={v} role="tab" type="button" aria-selected={tab === v} onClick={() => setTab(v)}
            className={cn("rounded-lg px-4 py-2 text-[0.95rem] font-semibold", tab === v ? "bg-card shadow-soft" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>

      {tab === "do" && (
        <>
          <Card title="Card details">
            <TextField label="Exercise name" value={ex.name} onChange={(name) => onChange({ name })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Sub-area label" value={ex.subArea} onChange={(subArea) => onChange({ subArea })} />
              <TextField label="Duration" value={ex.duration} onChange={(duration) => onChange({ duration })} />
            </div>
            <TextField multi label="Benefit" value={ex.benefit} onChange={(benefit) => onChange({ benefit })} />
            <TextField multi label="Safety warning" value={ex.safety} onChange={(safety) => onChange({ safety })} />
            <TextField label="Tip" value={ex.tip} onChange={(tip) => onChange({ tip })} />
          </Card>
          <Card title="Steps">
            <ListField label="Standard steps" items={ex.steps.map((s) => s.text)} onChange={(t) => onChange({ steps: toSteps(t, ex.steps) })} />
            <ListField label="Easier steps (leave empty to use Standard)" items={(ex.easierSteps ?? []).map((s) => s.text)}
              onChange={(t) => onChange({ easierSteps: toSteps(t, ex.easierSteps ?? []) })} />
          </Card>
          <Card title="Versions (shown when marking as done)">
            <TextField label="Easier" value={ex.versions.easier} onChange={(easier) => onChange({ versions: { ...ex.versions, easier } })} />
            <TextField label="Standard" value={ex.versions.standard} onChange={(standard) => onChange({ versions: { ...ex.versions, standard } })} />
            <TextField label="Harder" value={ex.versions.harder} onChange={(harder) => onChange({ versions: { ...ex.versions, harder } })} />
          </Card>
          <Card title="Videos">
            <TextField label="Easier video link" value={ex.videos.easier ?? ""} onChange={(v) => onChange({ videos: { ...ex.videos, easier: v || null } })} />
            <TextField label="Standard video link" value={ex.videos.standard ?? ""} onChange={(v) => onChange({ videos: { ...ex.videos, standard: v || null } })} />
          </Card>
        </>
      )}

      {tab === "help" && (
        <Card title="Helping someone">
          <ListField label="Where to stand" items={h.whereToStand} onChange={(whereToStand) => onChange({ helping: { ...h, whereToStand } })} />
          <TextField multi label="Safety for helpers" value={h.safety} onChange={(safety) => onChange({ helping: { ...h, safety } })} />
          <ListField label="Check yourself questions" items={h.checkYourself} onChange={(checkYourself) => onChange({ helping: { ...h, checkYourself } })} />
        </Card>
      )}

      {tab === "area" && (
        <Card title="Area">
          <TextField label="Area name (shown on tiles and lists)" value={areaName} onChange={onAreaName} />
          <p className="text-sm text-muted-foreground">This changes the name for all 7 exercises in this area.</p>
        </Card>
      )}
    </div>
  );
}

void AREAS;

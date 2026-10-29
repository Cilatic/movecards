import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check, Eye, Lightbulb, Play, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getArea, getExercise, type Exercise, type Version } from "@/lib/data/exercises";
import { useApp } from "@/lib/app-store";
import { BackButton, PillButton, PillSwitch } from "@/components/move/ui";
import { AreaFigure } from "@/components/move/AreaFigure";
import { Bars, DiagramSlot, VERSION_LABEL } from "@/components/move/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exercise/$id")({
  loader: ({ params }) => {
    const ex = getExercise(params.id);
    if (!ex) throw notFound();
    return { id: ex.id, name: ex.name, benefit: ex.benefit };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Exercise"} · Move Cards` },
      { name: "description", content: loaderData?.benefit ?? "A gentle exercise from the Move Cards deck." },
      { property: "og:title", content: `${loaderData?.name ?? "Exercise"} · Move Cards` },
      { property: "og:description", content: loaderData?.benefit ?? "A gentle exercise from the Move Cards deck." },
    ],
  }),
  component: ExercisePage,
});

type Side = "do" | "help";

function ExercisePage() {
  const { id } = Route.useLoaderData();
  const ex = getExercise(id)!;
  const area = getArea(ex.area)!;
  const { settings } = useApp();
  const [side, setSide] = useState<Side>(settings.mode === "helping" ? "help" : "do");
  const [simple, setSimple] = useState(false);
  const [sheet, setSheet] = useState(false);
  const help = side === "help";

  useEffect(() => setSide(settings.mode === "helping" ? "help" : "do"), [settings.mode]);

  if (simple) return <SimpleView ex={ex} onClose={() => setSimple(false)} />;

  return (
    <main className="mx-auto min-h-screen max-w-[30rem] pb-32">
      <header className={cn("relative overflow-hidden rounded-b-[2.5rem] px-6 pb-6 pt-8", help ? "bg-helper" : "bg-blush")}>
        <div aria-hidden className={cn("absolute -bottom-10 -right-6 h-48 w-48 rounded-full", help ? "bg-night-foreground/15" : "bg-strength/20")} />
        <AreaFigure pose={area.pose} className="absolute bottom-0 right-6 h-36 w-32" />
        <div className="relative flex items-center justify-between">
          <BackButton areaId={ex.area} />
          <button type="button" onClick={() => setSimple(true)} aria-label="Simple view" className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
            <Eye className="h-6 w-6" />
          </button>
        </div>
        <span className="relative mt-6 inline-block rounded-full bg-card px-4 py-1.5 text-sm font-bold">
          {area.name} · {ex.subArea} {ex.cardNumber}/7
        </span>
        <div className="h-16" />
      </header>

      <div className="space-y-5 px-5 pt-5">
        <PillSwitch<Side>
          label="Which side of the card"
          tone={help ? "helper" : "night"}
          value={side}
          onChange={setSide}
          options={[{ value: "do", label: "Do it" }, { value: "help", label: "Helping side" }]}
        />
        <div>
          <h1 className="text-title">{ex.name}</h1>
          <p className="mt-2 text-[1.05rem] text-muted-foreground">{ex.benefit}</p>
        </div>
        {help ? <HelpSide ex={ex} /> : <DoSide ex={ex} />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[30rem] bg-gradient-to-t from-background via-background to-transparent px-5 pb-5 pt-8">
        <PillButton onClick={() => setSheet(true)}><Check className="h-6 w-6" strokeWidth={3} /> Mark as done</PillButton>
      </div>
      {sheet && <MarkDoneSheet ex={ex} mode={settings.mode} onClose={() => setSheet(false)} />}
    </main>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <div role="note" className="flex gap-3 rounded-card bg-warning p-4 text-[1rem] font-semibold text-warning-foreground">
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
      <p>{text}</p>
    </div>
  );
}

function DoSide({ ex }: { ex: Exercise }) {
  const { settings } = useApp();
  const [level, setLevel] = useState<"easier" | "standard">(settings.videoLevel);
  const [speaking, setSpeaking] = useState(false);
  const url = ex.videos[level];

  function listen() {
    if (!("speechSynthesis" in window)) { toast.error("Listening isn't available on this device."); return; }
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(ex.steps.map((s, i) => `Step ${i + 1}. ${s.text}`).join(" "));
    u.rate = settings.voiceSpeed === "slow" ? 0.75 : 1;
    u.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <>
      <Warning text={ex.safety} />
      <div>
        {url ? (
          <video key={url} src={url} controls className="aspect-video w-full rounded-card bg-night" />
        ) : (
          <button type="button" onClick={() => toast("The video for this card is coming soon.")} className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-card bg-night text-night-foreground">
            <div aria-hidden className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-2 border-night-foreground/10" />
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"><Play className="ml-1 h-8 w-8" fill="currentColor" /></span>
            <span className="text-[0.95rem] font-semibold">Video · {VERSION_LABEL[level]} · {ex.duration}</span>
          </button>
        )}
        <div className="mt-3">
          <PillSwitch label="Video level" value={level} onChange={setLevel} options={[{ value: "easier", label: "Easier" }, { value: "standard", label: "Standard" }]} />
        </div>
      </div>
      <PillButton variant="white" onClick={listen} aria-pressed={speaking}>
        <Volume2 className="h-6 w-6" /> {speaking ? "Stop listening" : "Listen to the steps"}
      </PillButton>
      <section>
        <h2 className="text-section">How to do it</h2>
        <ol className="mt-3 space-y-3">
          {ex.steps.map((s, i) => (
            <li key={i} className="flex items-center gap-4 rounded-card bg-card p-4 shadow-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-night text-lg font-extrabold text-night-foreground">{i + 1}</span>
              <p className="flex-1 text-[1.05rem] font-semibold">{s.text}</p>
              {s.diagram ? <img src={s.diagram} alt={`Diagram: ${s.diagramLabel}`} className="h-20 w-20 rounded-2xl object-cover" /> : <DiagramSlot label={s.diagramLabel} className="h-20 w-20 shrink-0" />}
            </li>
          ))}
        </ol>
      </section>
      <div className="flex items-center gap-3 rounded-card bg-mustard/30 p-4 text-[1.05rem] font-bold">
        <Lightbulb className="h-6 w-6 shrink-0" aria-hidden /> Tip: {ex.tip}
      </div>
    </>
  );
}

function HelpSide({ ex }: { ex: Exercise }) {
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  return (
    <>
      <section className="rounded-card bg-helper-soft p-5">
        <h2 className="text-section">Where to stand</h2>
        <div className="mt-3 flex gap-4">
          {ex.helping.whereToStandDiagram ? (
            <img src={ex.helping.whereToStandDiagram} alt="Top-down diagram of where to stand" className="h-28 w-28 rounded-2xl object-cover" />
          ) : (
            <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 rounded-2xl bg-card" role="img" aria-label="Top-down diagram: helper stands slightly to the side of the chair">
              <rect x="30" y="35" width="40" height="40" rx="8" className="fill-beige" />
              <circle cx="50" cy="55" r="12" className="fill-mustard" />
              <circle cx="82" cy="40" r="10" className="fill-helper" />
              <path d="M72 46l-8 6" className="stroke-helper" strokeWidth="4" strokeLinecap="round" />
            </svg>
          )}
          <ul className="flex-1 list-disc space-y-1 pl-5 text-[1.05rem]">
            {ex.helping.whereToStand.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-balance p-4 text-night-foreground">
          <h3 className="text-[1.05rem] font-bold">Make it easier</h3>
          <p className="mt-1 text-[0.95rem]">{ex.helping.easier}</p>
        </div>
        <div className="rounded-card bg-strength p-4 text-night-foreground">
          <h3 className="text-[1.05rem] font-bold">Make it harder</h3>
          <p className="mt-1 text-[0.95rem]">{ex.helping.harder}</p>
        </div>
      </div>
      <Warning text={ex.helping.safety} />
      <section className="rounded-card bg-card p-5 shadow-soft">
        <h2 className="text-section">Check yourself</h2>
        <p className="text-[0.95rem] text-muted-foreground">Ask after the exercise:</p>
        <ul className="mt-3 space-y-2">
          {ex.helping.checkYourself.map((q, i) => (
            <li key={q}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked[i]}
                onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-helper-soft px-4 py-3 text-left text-[1rem] font-semibold"
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-helper", checked[i] && "bg-helper text-night-foreground")}>
                  {checked[i] && <Check className="h-5 w-5" strokeWidth={3} />}
                </span>
                {q}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function SimpleView({ ex, onClose }: { ex: Exercise; onClose: () => void }) {
  return (
    <main className="mx-auto min-h-screen max-w-[30rem] px-6 pb-12 pt-8">
      <button type="button" onClick={onClose} aria-label="Close simple view" className="flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-soft">
        <X className="h-7 w-7" />
      </button>
      <h1 className="text-title mt-6">{ex.name}</h1>
      <ol className="mt-8 space-y-8">
        {ex.steps.map((s, i) => (
          <li key={i} className="text-[1.6rem] font-bold leading-snug">
            <span className="mr-3 text-primary">{i + 1}.</span>{s.text}
          </li>
        ))}
      </ol>
    </main>
  );
}

function MarkDoneSheet({ ex, mode, onClose }: { ex: Exercise; mode: "me" | "helping"; onClose: () => void }) {
  const { addCompletion, status, continueAsGuest } = useApp();
  const navigate = useNavigate();
  const [version, setVersion] = useState<Version | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!version) return;
    setBusy(true);
    if (status === "signed-out") continueAsGuest();
    await addCompletion({ exerciseId: ex.id, version, mode, doneAt: new Date().toISOString() });
    toast.success("Well done! Saved to your history.");
    navigate({ to: "/history" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/60" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="w-full max-w-[30rem] rounded-t-[2rem] bg-background p-6 pb-8">
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        <h2 id="sheet-title" className="text-section">Which version did you do?</h2>
        <p className="text-[0.95rem] text-muted-foreground">{ex.name}</p>
        <div role="radiogroup" aria-label="Version done" className="mt-4 flex gap-3">
          {(["easier", "standard", "harder"] as Version[]).map((v, i) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={version === v}
              onClick={() => setVersion(v)}
              className={cn(
                "flex min-h-28 flex-1 flex-col items-center justify-center gap-2 rounded-card p-3 text-[1rem] font-bold",
                version === v ? "bg-blush outline-[3px] outline-night outline-solid" : "bg-card shadow-soft",
              )}
            >
              <Bars n={(i + 1) as 1 | 2 | 3} active={version === v} />
              {VERSION_LABEL[v]}
            </button>
          ))}
        </div>
        <p className="mt-4 min-h-12 text-[1.05rem]" aria-live="polite">
          {version ? <><strong>{VERSION_LABEL[version]}:</strong> {ex.versions[version]}</> : "Pick the one you did."}
        </p>
        <div className="mt-2 space-y-2">
          <PillButton disabled={!version || busy || status === "loading"} onClick={save}><Check className="h-6 w-6" strokeWidth={3} /> Save</PillButton>
          <button type="button" onClick={onClose} className="flex min-h-12 w-full items-center justify-center text-[1.05rem] font-bold underline underline-offset-4">Cancel</button>
        </div>
      </div>
    </div>
  );
}

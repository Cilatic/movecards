import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useApp, type TextSize } from "@/lib/app-store";
import { TabScreen } from "@/components/move/AppGate";
import { Field, PictureCard, PillButton } from "@/components/move/ui";
import { HelpingAvatar, MeAvatar } from "@/components/move/illustrations";
import { Bars, ClearHistoryDialog } from "@/components/move/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Move Cards" },
      { name: "description", content: "Text size, contrast, voice speed and more." },
      { property: "og:title", content: "Settings · Move Cards" },
      { property: "og:description", content: "Text size, contrast, voice speed and more." },
    ],
  }),
  component: () => (
    <TabScreen>
      <Settings />
    </TabScreen>
  ),
});

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card bg-card p-5 shadow-soft">
      <h2 className="text-section">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Waves({ n }: { n: number }) {
  return (
    <span aria-hidden className="flex h-10 items-center gap-1">
      {Array.from({ length: n }, (_, i) => <span key={i} className="w-1.5 rounded-full bg-night" style={{ height: `${[40, 80, 55, 95, 45, 70][i]}%` }} />)}
    </span>
  );
}

const SIZES: { v: TextSize; label: string; cls: string }[] = [
  { v: "normal", label: "Normal", cls: "text-xl" },
  { v: "large", label: "Large", cls: "text-[1.45rem]" },
  { v: "largest", label: "Largest", cls: "text-[1.7rem]" },
];

function Settings() {
  const { settings, updateSettings, email, status, signOut, clearHistory } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(settings.name);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setName(settings.name), [settings.name]);

  return (
    <main className="space-y-4 px-5 pt-10">
      <h1 className="text-title">Settings</h1>

      <Panel title="Your account">
        <p className="text-[1.05rem] text-muted-foreground">{status === "guest" ? "Not signed in – saved on this device" : email}</p>
        <Field id="name" label="Your name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <PillButton className="px-3" onClick={async () => { await updateSettings({ name: name.trim() }); toast.success("Name saved."); }}>Save name</PillButton>
          <PillButton variant="dark" className="px-3" onClick={async () => { await signOut(); navigate({ to: "/sign-in", replace: true }); }}>
            {status === "guest" ? "Sign in" : "Sign out"}
          </PillButton>
        </div>
      </Panel>

      <Panel title="Who is using the app?">
        <div role="radiogroup" aria-label="Who is using the app?" className="flex gap-3">
          <PictureCard label="Me" selected={settings.mode === "me"} onClick={() => void updateSettings({ mode: "me" })}><MeAvatar /></PictureCard>
          <PictureCard label="Helping someone" selected={settings.mode === "helping"} onClick={() => void updateSettings({ mode: "helping" })}><HelpingAvatar /></PictureCard>
        </div>
      </Panel>

      <Panel title="Reading">
        <p className="text-label">Text size</p>
        <div role="radiogroup" aria-label="Text size" className="flex gap-3">
          {SIZES.map((s) => (
            <PictureCard key={s.v} label={s.label} selected={settings.textSize === s.v} onClick={() => void updateSettings({ textSize: s.v })}>
              <span aria-hidden className={cn("font-extrabold", s.cls)}>Aa</span>
            </PictureCard>
          ))}
        </div>
        <p className="rounded-2xl bg-beige p-4 text-[1.05rem]"><strong>Preview:</strong> Squeeze firmly for 10 seconds.</p>
        <button
          type="button"
          role="switch"
          aria-checked={settings.highContrast}
          onClick={() => void updateSettings({ highContrast: !settings.highContrast })}
          className="flex min-h-16 w-full items-center justify-between gap-4 text-left"
        >
          <span>
            <span className="block text-[1.05rem] font-bold">High contrast</span>
            <span className="block text-[0.95rem] text-muted-foreground">Darker text, thicker borders</span>
          </span>
          <span className={cn("relative h-9 w-16 shrink-0 rounded-full transition", settings.highContrast ? "bg-night" : "bg-beige")}>
            <span className={cn("absolute top-1 h-7 w-7 rounded-full bg-card shadow-soft transition-all", settings.highContrast ? "left-8" : "left-1")} />
          </span>
        </button>
      </Panel>

      <Panel title="Exercises">
        <p className="text-label">Voice speed for Listen</p>
        <div role="radiogroup" aria-label="Voice speed" className="flex gap-3">
          <PictureCard label="Slow" selected={settings.voiceSpeed === "slow"} onClick={() => void updateSettings({ voiceSpeed: "slow" })}><Waves n={3} /></PictureCard>
          <PictureCard label="Normal" selected={settings.voiceSpeed === "normal"} onClick={() => void updateSettings({ voiceSpeed: "normal" })}><Waves n={6} /></PictureCard>
        </div>
        <p className="text-label">Default video level</p>
        <div role="radiogroup" aria-label="Default video level" className="flex gap-3">
          <PictureCard label="Easier" selected={settings.videoLevel === "easier"} onClick={() => void updateSettings({ videoLevel: "easier" })}><Bars n={1} /></PictureCard>
          <PictureCard label="Standard" selected={settings.videoLevel === "standard"} onClick={() => void updateSettings({ videoLevel: "standard" })}><Bars n={2} /></PictureCard>
        </div>
      </Panel>

      <Panel title="My history">
        <PillButton variant="danger" onClick={() => setConfirm(true)}><Trash2 className="h-5 w-5" /> Clear my history</PillButton>
      </Panel>

      {confirm && <ClearHistoryDialog onClose={() => setConfirm(false)} onConfirm={async () => { await clearHistory(); toast.success("History cleared."); }} />}
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/move/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/how-to-use")({
  head: () => ({
    meta: [
      { title: "How to use the cards · Move Cards" },
      { name: "description", content: "Pick a card, scan the QR code, follow the steps and tap Mark as done." },
      { property: "og:title", content: "How to use the cards · Move Cards" },
      { property: "og:description", content: "Pick, scan, move." },
    ],
  }),
  component: HowTo,
});

function Pick() {
  return (
    <svg viewBox="0 0 120 90" className="h-24 w-32" aria-hidden>
      <rect x="18" y="14" width="44" height="62" rx="8" className="fill-balance" transform="rotate(-12 40 45)" />
      <rect x="40" y="10" width="44" height="62" rx="8" className="fill-strength" />
      <rect x="62" y="14" width="44" height="62" rx="8" className="fill-background" transform="rotate(12 84 45)" />
    </svg>
  );
}
function Scan() {
  return (
    <svg viewBox="0 0 120 90" className="h-24 w-32" aria-hidden>
      <rect x="38" y="6" width="44" height="78" rx="9" className="fill-night" />
      <rect x="43" y="14" width="34" height="56" rx="4" className="fill-background" />
      {[[48, 22], [62, 22], [48, 36], [66, 40], [52, 52], [62, 56]].map(([x, y], i) => <rect key={i} x={x} y={y} width="9" height="9" className="fill-night" />)}
    </svg>
  );
}
function Done() {
  return (
    <svg viewBox="0 0 120 90" className="h-24 w-32" aria-hidden>
      <circle cx="60" cy="45" r="34" className="fill-background" />
      <path d="M44 46l11 11 22-24" className="fill-none stroke-strength" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  { text: "Pick a card from the deck.", cls: "bg-mustard text-foreground", Art: Pick },
  { text: "Scan the QR code with your phone camera.", cls: "bg-balance text-night-foreground", Art: Scan },
  { text: "Follow the steps, then tap Mark as done.", cls: "bg-strength text-night-foreground", Art: Done },
];

function HowTo() {
  return (
    <main className="mx-auto min-h-screen max-w-[30rem] px-5 pb-12 pt-8">
      <BackButton />
      <h1 className="text-title mt-6">How to use the cards</h1>
      <ol className="mt-6 space-y-4">
        {STEPS.map(({ text, cls, Art }, i) => (
          <li key={i} className={cn("relative flex min-h-36 items-center gap-3 overflow-hidden rounded-card p-5", cls)}>
            <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-night-foreground/15" />
            <div className="relative flex-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-xl font-extrabold text-foreground">{i + 1}</span>
              <p className="mt-3 text-[1.2rem] font-bold leading-snug">{text}</p>
            </div>
            <div className="relative"><Art /></div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[1.05rem] text-muted-foreground">More guidance coming soon.</p>
    </main>
  );
}

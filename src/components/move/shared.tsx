import { useState } from "react";
import type { AreaId, Version } from "@/lib/data/exercises";
import { PillButton } from "./ui";
import { cn } from "@/lib/utils";

export const AREA_BG: Record<AreaId, string> = {
  strength: "bg-strength text-night-foreground",
  flexibility: "bg-flexibility text-foreground",
  heart: "bg-heart text-night-foreground",
  balance: "bg-balance text-night-foreground",
  mind: "bg-mind text-night-foreground",
};

export const VERSION_LABEL: Record<Version, string> = { easier: "Easier", standard: "Standard", harder: "Harder" };

export function Bars({ n, active }: { n: 1 | 2 | 3; active?: boolean }) {
  return (
    <span aria-hidden className="flex h-10 items-end gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-3 rounded-full", i <= n ? (active ? "bg-primary" : "bg-night") : "bg-beige")}
          style={{ height: `${i * 33}%` }}
        />
      ))}
    </span>
  );
}

/** Confirmation used by History options and Settings */
export function ClearHistoryDialog({ onConfirm, onClose }: { onConfirm: () => Promise<void> | void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="clear-title">
      <div className="w-full max-w-[28rem] rounded-card bg-card p-6 shadow-float">
        <h2 id="clear-title" className="text-section">Clear all history?</h2>
        <p className="mt-2 text-[1.05rem]">This removes every entry. You cannot undo it.</p>
        <div className="mt-6 space-y-3">
          <PillButton variant="dark" onClick={onClose} autoFocus>Keep my history</PillButton>
          <PillButton
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
              onClose();
            }}
          >
            Yes, clear history
          </PillButton>
        </div>
      </div>
    </div>
  );
}

export function DiagramSlot({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-center text-[0.8rem] font-semibold text-muted-foreground", className)}>
      Diagram:
      <br />
      {label}
    </div>
  );
}

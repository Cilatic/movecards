import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { PillButton } from "./ui";

export function GoalPicker({ value, onChange, id }: { value: number; onChange: (value: number) => void; id: string }) {
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-[1.05rem] font-bold">
        Days each week <output htmlFor={id}>{value} {value === 1 ? "day" : "days"}</output>
      </label>
      <input id={id} type="range" min={1} max={7} step={1} value={value} aria-valuetext={`${value} ${value === 1 ? "day" : "days"}`} onChange={(event) => onChange(Number(event.target.value))} className="min-h-12 w-full cursor-pointer accent-primary" />
      <div aria-hidden className="flex justify-between text-base font-semibold"><span>1 day</span><span>7 days</span></div>
    </div>
  );
}

export function WeeklyGoalDialog({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useApp();
  const [goal, setGoal] = useState(settings.weeklyGoal);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await updateSettings({ weeklyGoal: goal });
      toast.success("Weekly goal saved.");
      onClose();
    } catch {
      toast.error("Your goal couldn't be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/60" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[28rem] -translate-x-1/2 -translate-y-1/2 space-y-6 rounded-card bg-card p-6 shadow-float">
          <Dialog.Title className="text-section">Weekly goal</Dialog.Title>
          <GoalPicker id="weekly-goal-dialog" value={goal} onChange={setGoal} />
          <div className="space-y-3">
            <PillButton onClick={save} disabled={busy}>{busy ? "Saving…" : "Save goal"}</PillButton>
            <PillButton variant="white" onClick={onClose} disabled={busy}>Cancel</PillButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
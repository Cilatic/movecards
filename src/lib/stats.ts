import type { Completion } from "@/lib/app-store";

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Monday-first dates of the week containing `now` */
export function weekDays(now: Date): Date[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function weekStats(completions: Completion[], now = new Date()) {
  const days = weekDays(now);
  const doneKeys = new Set(completions.map((c) => dayKey(new Date(c.doneAt))));
  const weekKeys = new Set(days.map(dayKey));
  const inWeek = completions.filter((c) => weekKeys.has(dayKey(new Date(c.doneAt))));
  const daysDone = days.filter((d) => doneKeys.has(dayKey(d))).length;

  // Streak: consecutive days with activity ending today (or yesterday if today not yet done)
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!doneKeys.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (doneKeys.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    days: days.map((d) => ({ date: d, done: doneKeys.has(dayKey(d)), isToday: dayKey(d) === dayKey(now) })),
    daysDone,
    exercisesThisWeek: inWeek.length,
    streak,
  };
}

/** Distinct exercises ever done, per exercise id */
export const doneExerciseIds = (completions: Completion[]) => new Set(completions.map((c) => c.exerciseId));

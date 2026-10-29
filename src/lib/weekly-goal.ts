export const DEFAULT_WEEKLY_GOAL = 3;

export function isWeeklyGoal(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 7;
}

export function goalProgress(daysDone: number, goal: number): number {
  return Math.min(1, Math.max(0, daysDone / goal));
}
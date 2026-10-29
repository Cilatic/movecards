import { describe, expect, it } from "vitest";
import { DEFAULT_WEEKLY_GOAL, goalProgress, isWeeklyGoal } from "@/lib/weekly-goal";

describe("weekly goal", () => {
  it("defaults to 3 days", () => { expect(DEFAULT_WEEKLY_GOAL).toBe(3); });
  it("allows whole days from 1 to 7 only", () => {
    for (let day = 1; day <= 7; day++) expect(isWeeklyGoal(day)).toBe(true);
    for (const invalid of [0, 8, 2.5, NaN, "3", null]) expect(isWeeklyGoal(invalid)).toBe(false);
  });
  it("uses the chosen goal and caps completed progress", () => {
    expect(goalProgress(1, 3)).toBe(1 / 3);
    expect(goalProgress(3, 3)).toBe(1);
    expect(goalProgress(5, 3)).toBe(1);
    expect(goalProgress(3, 7)).toBe(3 / 7);
  });
});
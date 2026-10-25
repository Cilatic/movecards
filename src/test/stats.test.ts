import { describe, expect, it } from "vitest";
import { weekStats } from "@/lib/stats";
import type { Completion } from "@/lib/app-store";

const c = (iso: string): Completion => ({ id: iso, exerciseId: "strength-1", version: "standard", mode: "me", doneAt: iso });
// Sunday 25 Oct 2026
const now = new Date(2026, 9, 25, 12);

describe("weekStats", () => {
  it("counts distinct days done this week (Mon–Sun) out of 7", () => {
    const s = weekStats([c(new Date(2026, 9, 19, 9).toISOString()), c(new Date(2026, 9, 19, 15).toISOString()), c(new Date(2026, 9, 21).toISOString()), c(new Date(2026, 9, 18).toISOString())], now);
    expect(s.daysDone).toBe(2);
    expect(s.exercisesThisWeek).toBe(3);
  });
  it("streak counts consecutive days ending today", () => {
    const s = weekStats([c(new Date(2026, 9, 25).toISOString()), c(new Date(2026, 9, 24).toISOString()), c(new Date(2026, 9, 22).toISOString())], now);
    expect(s.streak).toBe(2);
  });
  it("streak still counts from yesterday when today isn't done yet", () => {
    const s = weekStats([c(new Date(2026, 9, 24).toISOString()), c(new Date(2026, 9, 23).toISOString())], now);
    expect(s.streak).toBe(2);
  });
});

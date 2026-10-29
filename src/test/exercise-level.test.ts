import { describe, expect, it } from "vitest";
import { EXERCISES, getExerciseSteps, type Exercise } from "@/lib/data/exercises";

const exercise = EXERCISES[0];
if (!exercise) throw new Error("An exercise is required for level tests.");

describe("Exercise step levels", () => {
  it("uses separate Easier steps when supplied", () => {
    const easierSteps = exercise.steps.slice(0, 1);
    const withEasier: Exercise = { ...exercise, easierSteps };
    expect(getExerciseSteps(withEasier, "easier")).toBe(easierSteps);
  });
  it("keeps Standard steps when Easier steps are supplied", () => {
    expect(getExerciseSteps({ ...exercise, easierSteps: [] }, "standard")).toBe(exercise.steps);
  });
  it("falls back to Standard when Easier steps are absent", () => {
    expect(getExerciseSteps(exercise, "easier")).toBe(exercise.steps);
  });
  it("falls back to Standard when Easier steps are empty", () => {
    expect(getExerciseSteps({ ...exercise, easierSteps: [] }, "easier")).toBe(exercise.steps);
  });
});
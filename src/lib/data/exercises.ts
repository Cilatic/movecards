export type AreaId = "strength" | "flexibility" | "heart" | "balance" | "mind";
export type Version = "easier" | "standard" | "harder";
export type Mode = "me" | "helping";

export interface Area {
  id: AreaId;
  name: string;
  /** Tailwind token suffix, e.g. bg-strength */
  token: AreaId;
  /** Text colour that reads on the area colour */
  onColor: "light" | "dark";
  pose: "chair-stand" | "arms-up" | "marching" | "one-leg" | "seated-calm";
}

export const AREAS: Area[] = [
  { id: "strength", name: "Strength", token: "strength", onColor: "light", pose: "chair-stand" },
  { id: "flexibility", name: "Flexibility", token: "flexibility", onColor: "dark", pose: "arms-up" },
  { id: "heart", name: "Heart", token: "heart", onColor: "light", pose: "marching" },
  { id: "balance", name: "Balance", token: "balance", onColor: "light", pose: "one-leg" },
  { id: "mind", name: "Mind", token: "mind", onColor: "light", pose: "seated-calm" },
];

export interface Step {
  text: string;
  /** Optional diagram image URL; null shows a dashed placeholder */
  diagram: string | null;
  diagramLabel: string;
}

export interface Exercise {
  id: string;
  area: AreaId;
  cardNumber: number;
  name: string;
  subArea: string;
  duration: string;
  benefit: string;
  steps: Step[];
  /** Optional Easier steps; steps remains the Standard version. */
  easierSteps?: Step[];
  tip: string;
  safety: string;
  videos: { easier: string | null; standard: string | null };
  versions: Record<Version, string>;
  helping: {
    whereToStand: string[];
    whereToStandDiagram: string | null;
    easier: string;
    harder: string;
    safety: string;
    checkYourself: string[];
  };
  placeholder: boolean;
}

const grip: Exercise = {
  id: "strength-1",
  area: "strength",
  cardNumber: 1,
  name: "Towel/Ball Grip Squeeze",
  subArea: "Grip",
  duration: "under 1 minute",
  benefit: "Stronger hands for jars, keys and holding hands.",
  steps: [
    { text: "Hold a rolled towel or soft ball.", diagram: null, diagramLabel: "grip" },
    { text: "Squeeze firmly for 10 seconds.", diagram: null, diagramLabel: "squeeze" },
    { text: "Release. Repeat 5 times per hand.", diagram: null, diagramLabel: "release" },
  ],
  tip: "Small squeeze, big progress!",
  safety: "Stop and take a break if you feel pain, swelling, or lose your grip.",
  videos: { easier: null, standard: null },
  versions: {
    easier: "Hold for 5 seconds, fewer reps.",
    standard: "Hold for 10 seconds, 5 times per hand.",
    harder: "Hold for 10 to 15 seconds, 8 to 10 reps.",
  },
  helping: {
    whereToStand: ["Stand slightly to the side.", "Keep the chair steady.", "Offer your arm if needed."],
    whereToStandDiagram: null,
    easier: "Hold for 5 seconds, fewer reps.",
    harder: "Hold for 10 to 15 seconds, 8 to 10 reps.",
    safety: "Stop and rest if they feel pain, dizziness or get short of breath.",
    checkYourself: [
      "Did the squeeze feel firm but comfortable?",
      "Did both hands feel about the same?",
      "Any pain or tingling in your fingers or wrist?",
    ],
  },
  placeholder: false,
};

function placeholder(area: Area, n: number): Exercise {
  return {
    id: `${area.id}-${n}`,
    area: area.id,
    cardNumber: n,
    name: `${area.name} exercise ${n}`,
    subArea: area.name,
    duration: "under 1 minute",
    benefit: "Benefit coming soon.",
    steps: [1, 2, 3].map((s) => ({ text: `Step ${s} coming soon.`, diagram: null, diagramLabel: `step ${s}` })),
    tip: "Tip coming soon.",
    safety: "Stop and rest if anything hurts or you feel unwell.",
    videos: { easier: null, standard: null },
    versions: {
      easier: "A gentler version with fewer reps.",
      standard: "The version shown on the card.",
      harder: "A little longer, a few more reps.",
    },
    helping: {
      whereToStand: ["Guidance coming soon."],
      whereToStandDiagram: null,
      easier: "Coming soon.",
      harder: "Coming soon.",
      safety: "Stop and rest if they feel pain, dizziness or get short of breath.",
      checkYourself: ["Question 1 coming soon.", "Question 2 coming soon.", "Question 3 coming soon."],
    },
    placeholder: true,
  };
}

export const EXERCISES: Exercise[] = AREAS.flatMap((area) =>
  [1, 2, 3, 4, 5, 6, 7].map((n) => (area.id === "strength" && n === 1 ? grip : placeholder(area, n))),
);

export const getArea = (id: string) => AREAS.find((a) => a.id === id);
export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);
export const getExerciseSteps = (exercise: Exercise, level: "easier" | "standard"): Step[] =>
  level === "easier" && exercise.easierSteps?.length ? exercise.easierSteps : exercise.steps;
export const exercisesInArea = (id: AreaId) => EXERCISES.filter((e) => e.area === id);

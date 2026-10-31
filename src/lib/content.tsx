import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AREAS, EXERCISES, type Area, type AreaId, type Exercise } from "@/lib/data/exercises";

export type AreaOverride = Partial<Pick<Area, "name">>;
export type ExerciseOverride = Partial<Omit<Exercise, "id" | "area" | "cardNumber">>;
export type ContentMap = Record<string, unknown>;

export const exerciseKey = (id: string) => `exercise:${id}`;
export const areaKey = (id: string) => `area:${id}`;
export const PREVIEW_MESSAGE = "move-cards-preview";

/** Merge saved overrides on top of the built-in content. Ids, areas and order never change. */
export function mergeContent(map: ContentMap) {
  const areas = AREAS.map((a) => ({ ...a, ...((map[areaKey(a.id)] as AreaOverride) ?? {}), id: a.id }));
  const exercises = EXERCISES.map((e) => {
    const o = (map[exerciseKey(e.id)] as ExerciseOverride) ?? {};
    return { ...e, ...o, helping: { ...e.helping, ...(o.helping ?? {}) }, versions: { ...e.versions, ...(o.versions ?? {}) }, id: e.id, area: e.area, cardNumber: e.cardNumber };
  });
  return {
    areas,
    exercises,
    getArea: (id: string) => areas.find((a) => a.id === id),
    getExercise: (id: string) => exercises.find((e) => e.id === id),
    exercisesInArea: (id: AreaId) => exercises.filter((e) => e.area === id),
  };
}

type Content = ReturnType<typeof mergeContent>;
const Ctx = createContext<Content>(mergeContent({}));

export function ContentProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery({
    queryKey: ["content", "published"],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_entries").select("key, published");
      if (error) throw error;
      const map: ContentMap = {};
      for (const r of data) if (r.published) map[r.key] = r.published;
      return map;
    },
    staleTime: 60_000,
  });
  const [preview, setPreview] = useState<ContentMap | null>(null);

  useEffect(() => {
    if (window.parent === window) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
      setPreview(e.data.content as ContentMap);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: `${PREVIEW_MESSAGE}-ready` }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const value = useMemo(() => mergeContent(preview ?? data ?? {}), [preview, data]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useContent = () => useContext(Ctx);

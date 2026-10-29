import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Mode, Version } from "@/lib/data/exercises";
import { DEFAULT_WEEKLY_GOAL, isWeeklyGoal } from "@/lib/weekly-goal";

export type TextSize = "normal" | "large" | "largest";
export interface Settings {
  weeklyGoal: number;
  name: string;
  mode: Mode;
  textSize: TextSize;
  highContrast: boolean;
  voiceSpeed: "slow" | "normal";
  videoLevel: "easier" | "standard";
}
export interface Completion {
  id: string;
  exerciseId: string;
  version: Version;
  mode: Mode;
  doneAt: string; // ISO
}

export const DEFAULT_SETTINGS: Settings = {
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  name: "",
  mode: "me",
  textSize: "normal",
  highContrast: false,
  voiceSpeed: "normal",
  videoLevel: "standard",
};

const GUEST_FLAG = "movecards.guest";
const GUEST_SETTINGS = "movecards.guest.settings";
const GUEST_COMPLETIONS = "movecards.guest.completions";

type Status = "loading" | "signed-out" | "guest" | "signed-in";

interface AppState {
  status: Status;
  email: string | null;
  settings: Settings;
  completions: Completion[];
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  addCompletion: (c: Omit<Completion, "id">) => Promise<void>;
  updateCompletion: (id: string, patch: Partial<Pick<Completion, "version" | "doneAt">>) => Promise<void>;
  deleteCompletion: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type ProfileRow = {
  weekly_goal: number;
  name: string;
  mode: string;
  text_size: string;
  high_contrast: boolean;
  voice_speed: string;
  video_level: string;
};
const fromRow = (r: ProfileRow): Settings => ({
  weeklyGoal: r.weekly_goal,
  name: r.name,
  mode: r.mode as Mode,
  textSize: r.text_size as TextSize,
  highContrast: r.high_contrast,
  voiceSpeed: r.voice_speed as Settings["voiceSpeed"],
  videoLevel: r.video_level as Settings["videoLevel"],
});
const toRow = (s: Partial<Settings>) => {
  const r: {
    name?: string; mode?: string; text_size?: string; high_contrast?: boolean; voice_speed?: string; video_level?: string; weekly_goal?: number;
  } = {};
  if (s.weeklyGoal !== undefined) r.weekly_goal = s.weeklyGoal;
  if (s.name !== undefined) r.name = s.name;
  if (s.mode !== undefined) r.mode = s.mode;
  if (s.textSize !== undefined) r.text_size = s.textSize;
  if (s.highContrast !== undefined) r.high_contrast = s.highContrast;
  if (s.voiceSpeed !== undefined) r.voice_speed = s.voiceSpeed;
  if (s.videoLevel !== undefined) r.video_level = s.videoLevel;
  return r;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [completions, setCompletions] = useState<Completion[]>([]);

  const loadCloud = useCallback(async (s: Session) => {
    const uid = s.user.id;
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (prof) setSettings(fromRow(prof));
    else {
      const name = (s.user.user_metadata?.['name'] || s.user.user_metadata?.['full_name'] || "") as string;
      await supabase.from("profiles").insert({ id: uid, name });
      setSettings({ ...DEFAULT_SETTINGS, name });
    }
    const { data: rows } = await supabase
      .from("completions")
      .select("*")
      .order("done_at", { ascending: false });
    setCompletions(
      (rows ?? []).map((r) => ({
        id: r.id,
        exerciseId: r.exercise_id,
        version: r.version as Version,
        mode: r.mode as Mode,
        doneAt: r.done_at,
      })),
    );
    setStatus("signed-in");
  }, []);

  const loadGuest = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...readJSON(GUEST_SETTINGS, {}) });
    setCompletions(readJSON<Completion[]>(GUEST_COMPLETIONS, []));
    setStatus("guest");
  }, []);

  useEffect(() => {
    const apply = (s: Session | null) => {
      setSession(s);
      if (s) {
        localStorage.removeItem(GUEST_FLAG);
        void loadCloud(s);
      } else if (localStorage.getItem(GUEST_FLAG)) loadGuest();
      else {
        setSettings(DEFAULT_SETTINGS);
        setCompletions([]);
        setStatus("signed-out");
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => apply(s), 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    return () => sub.subscription.unsubscribe();
  }, [loadCloud, loadGuest]);

  // Apply reading preferences to the whole app
  useEffect(() => {
    const html = document.documentElement;
    html.dataset['text'] = settings.textSize;
    html.dataset['contrast'] = settings.highContrast ? "high" : "normal";
  }, [settings.textSize, settings.highContrast]);

  const isGuest = status === "guest";
  const persistGuest = (next: Completion[]) => localStorage.setItem(GUEST_COMPLETIONS, JSON.stringify(next));

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (patch.weeklyGoal !== undefined) {
        if (!isWeeklyGoal(patch.weeklyGoal)) throw new Error("Weekly goal must be 1 to 7 whole days.");
        if (session) {
          const { error } = await supabase.from("profiles").update(toRow(patch)).eq("id", session.user.id);
          if (error) throw error;
        }
      }
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (isGuest) localStorage.setItem(GUEST_SETTINGS, JSON.stringify(next));
        return next;
      });
      if (session && patch.weeklyGoal === undefined) await supabase.from("profiles").update(toRow(patch)).eq("id", session.user.id);
    },
    [isGuest, session],
  );

  const addCompletion = useCallback(
    async (c: Omit<Completion, "id">) => {
      if (session) {
        const { data } = await supabase
          .from("completions")
          .insert({ user_id: session.user.id, exercise_id: c.exerciseId, version: c.version, mode: c.mode, done_at: c.doneAt })
          .select()
          .single();
        if (data) setCompletions((p) => [{ ...c, id: data.id }, ...p]);
      } else {
        setCompletions((p) => {
          const next = [{ ...c, id: crypto.randomUUID() }, ...p];
          persistGuest(next);
          return next;
        });
      }
    },
    [session],
  );

  const updateCompletion = useCallback(
    async (id: string, patch: Partial<Pick<Completion, "version" | "doneAt">>) => {
      if (session) {
        const row: { version?: string; done_at?: string } = {};
        if (patch.version) row.version = patch.version;
        if (patch.doneAt) row.done_at = patch.doneAt;
        await supabase.from("completions").update(row).eq("id", id);
      }
      setCompletions((p) => {
        const next = p.map((c) => (c.id === id ? { ...c, ...patch } : c));
        if (!session) persistGuest(next);
        return next;
      });
    },
    [session],
  );

  const deleteCompletion = useCallback(
    async (id: string) => {
      if (session) await supabase.from("completions").delete().eq("id", id);
      setCompletions((p) => {
        const next = p.filter((c) => c.id !== id);
        if (!session) persistGuest(next);
        return next;
      });
    },
    [session],
  );

  const clearHistory = useCallback(async () => {
    if (session) await supabase.from("completions").delete().eq("user_id", session.user.id);
    else persistGuest([]);
    setCompletions([]);
  }, [session]);

  const continueAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_FLAG, "1");
    loadGuest();
  }, [loadGuest]);

  const signOut = useCallback(async () => {
    localStorage.removeItem(GUEST_FLAG);
    if (session) await supabase.auth.signOut();
    setSettings(DEFAULT_SETTINGS);
    setCompletions([]);
    setStatus("signed-out");
  }, [session]);

  const value = useMemo<AppState>(
    () => ({
      status,
      email: session?.user.email ?? null,
      settings,
      completions,
      updateSettings,
      addCompletion,
      updateCompletion,
      deleteCompletion,
      clearHistory,
      continueAsGuest,
      signOut,
    }),
    [status, session, settings, completions, updateSettings, addCompletion, updateCompletion, deleteCompletion, clearHistory, continueAsGuest, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

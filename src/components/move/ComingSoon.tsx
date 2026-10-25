import { useApp } from "@/lib/app-store";
import { TabScreen } from "./AppGate";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <TabScreen>
      <Inner title={title} note={note} />
    </TabScreen>
  );
}

function Inner({ title, note }: { title: string; note: string }) {
  const { settings, status } = useApp();
  return (
    <main className="px-6 pt-10">
      <h1 className="text-title">{title}</h1>
      <p className="mt-2 text-[1.05rem] text-muted-foreground">{note}</p>
      <div className="mt-6 rounded-card border-2 border-dashed border-border p-6 text-[1.05rem]">
        {status === "guest" ? "You're using the app without signing in. Your progress saves on this device." : `Signed in${settings.name ? ` as ${settings.name}` : ""}.`}
      </div>
    </main>
  );
}

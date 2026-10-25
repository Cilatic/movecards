import { useApp } from "@/lib/app-store";
import { TabScreen } from "./AppGate";
import { PillButton } from "./ui";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <TabScreen>
      <Inner title={title} note={note} />
    </TabScreen>
  );
}

function Inner({ title, note }: { title: string; note: string }) {
  const { settings, status, signOut } = useApp();
  return (
    <main className="px-6 pt-10">
      <h1 className="text-title">{title}</h1>
      <p className="mt-2 text-[1.05rem] text-muted-foreground">{note}</p>
      <div className="mt-6 rounded-card border-2 border-dashed border-border p-6 text-[1.05rem]">
        {status === "guest" ? "You're using the app without signing in. Your progress saves on this device." : `Signed in${settings.name ? ` as ${settings.name}` : ""}.`}
      </div>
      <PillButton variant="white" className="mt-6" onClick={() => void signOut()}>
        {status === "guest" ? "Back to sign in" : "Sign out"}
      </PillButton>
    </main>
  );
}

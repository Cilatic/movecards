import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, House, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", Icon: House },
  { to: "/exercises", label: "Exercises", Icon: Dumbbell },
  { to: "/history", label: "History", Icon: CalendarDays },
  { to: "/settings", label: "Settings", Icon: SlidersHorizontal },
] as const;

export function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-[28rem] rounded-full bg-night px-2 py-2 shadow-float"
    >
      <ul className="flex">
        {TABS.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 rounded-full text-[0.8rem] font-bold",
                  active ? "text-mustard" : "text-night-foreground/80 hover:text-night-foreground",
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={2.4} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

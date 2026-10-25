import { cva, type VariantProps } from "class-variance-authority";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const pill = cva(
  "inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-6 text-[1.1rem] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        dark: "bg-night text-night-foreground hover:bg-night-soft",
        white: "bg-card text-foreground shadow-soft hover:bg-blush",
        danger: "border-2 border-destructive bg-card text-destructive hover:bg-warning",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function PillButton({
  variant,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof pill>) {
  return <button className={cn(pill({ variant }), className)} {...props} />;
}

export function BackButton({ to, label = "Back" }: { to?: string; label?: string }) {
  const router = useRouter();
  const cls =
    "inline-flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-soft hover:bg-blush";
  if (to)
    return (
      <Link to={to} aria-label={label} className={cls}>
        <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
      </Link>
    );
  return (
    <button type="button" aria-label={label} className={cls} onClick={() => router.history.back()}>
      <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}

export function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[1.05rem] font-bold">
        {label}
      </label>
      <input id={id} className="field contrast-border" {...props} />
    </div>
  );
}

/** Two-way pill switch on a beige track, dark selected segment */
export function PillSwitch<T extends string>({
  options,
  value,
  onChange,
  tone = "night",
  onDark = false,
  label,
}: {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  tone?: "night" | "helper";
  onDark?: boolean;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-full p-1.5", onDark ? "bg-night-soft" : "bg-beige")}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 text-base font-bold transition",
              active
                ? onDark
                  ? "bg-card text-foreground"
                  : tone === "helper"
                    ? "bg-helper text-night-foreground"
                    : "bg-night text-night-foreground"
                : onDark
                  ? "text-night-foreground"
                  : "text-foreground",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Picture card for visual choices – 3px dark outline when selected */
export function PictureCard({
  selected,
  onClick,
  children,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-32 flex-1 flex-col items-center justify-center gap-2 rounded-card p-4 text-[1.05rem] font-bold transition",
        selected ? "bg-blush outline-[3px] outline-night outline-solid" : "bg-card shadow-soft hover:bg-blush/50",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

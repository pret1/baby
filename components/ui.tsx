import type { ComponentProps, ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const inputClass =
  "w-full min-w-0 rounded-xl border border-line bg-bg px-3 py-2.5 text-base text-fg outline-none focus:border-accent aria-[invalid=true]:border-bad";

export const primaryButtonClass =
  "w-full rounded-xl bg-accent px-4 py-3 font-bold text-white disabled:opacity-60";

export const softButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-accent-soft px-2.5 py-1.5 text-[13px] font-medium text-fg disabled:opacity-60";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mb-3 rounded-2xl border border-line bg-card p-3.5", className)} {...props} />
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-bold">{children}</h2>;
}

export function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("mt-2 block min-w-0", className)}>
      <span className="mb-1 block text-[13px] text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[13px] text-bad">{error}</span>}
    </label>
  );
}

export function Checkbox({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="my-2 flex items-center gap-2 text-[15px]">
      <input type="checkbox" className="size-5 flex-none accent-accent" {...props} />
      {label}
    </label>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-sm text-bad">
      {children}
    </p>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: Tone }) {
  return (
    <div className="rounded-xl border border-line bg-card p-2.5">
      <b className={cn("block text-xl leading-tight", tone && toneText[tone])}>{value}</b>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="mb-3 grid grid-cols-2 gap-2">{children}</div>;
}

export type Tone = "ok" | "warn" | "bad" | "cool";

const toneText: Record<Tone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  cool: "text-cool",
};

export function Tag({ children, tone }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        "mt-0.5 mr-1 inline-block rounded-full bg-accent-soft px-2 py-px text-xs",
        tone && toneText[tone],
        tone && "font-semibold",
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-line/60", className)} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-4 text-center text-sm text-muted">{children}</p>;
}

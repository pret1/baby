"use client";

import Link from "next/link";
import { formatAge } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { softButtonClass } from "./ui";

export function ChildHeader({
  name,
  birthDate,
  showProfileLink = true,
}: {
  name: string;
  birthDate: Date;
  showProfileLink?: boolean;
}) {
  const now = useNow();

  return (
    <header className="mb-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold">{name}</h1>
        <p className="text-sm text-muted">
          {now ? `Возраст: ${formatAge(birthDate, new Date(now))}` : " "}
        </p>
      </div>
      {showProfileLink && (
        <Link href="/profile" className={softButtonClass}>
          Профиль
        </Link>
      )}
    </header>
  );
}

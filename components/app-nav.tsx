"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";

const items = [
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/feeding", label: "Кормление", icon: "🍼" },
  { href: "/weight", label: "Вес", icon: "⚖️" },
  { href: "/height", label: "Рост", icon: "📏" },
  { href: "/temperature", label: "Температура", icon: "🌡️" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Temperature } from "@/lib/db/schema";
import { useNow } from "@/lib/use-now";
import { Skeleton, softButtonClass } from "../ui";
import { TemperatureForm } from "./temperature-form";
import { TemperatureList } from "./temperature-list";
import { TemperatureStats } from "./temperature-stats";

export function TemperatureView({
  temperatures,
  hasOlder,
  days,
}: {
  temperatures: Temperature[];
  hasOlder: boolean;
  days: number;
}) {
  const now = useNow();
  const [editing, setEditing] = useState<Temperature | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const startEditing = (t: Temperature) => {
    setEditing(t);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {now === null ? (
        <Skeleton className="mb-3 h-24" />
      ) : (
        <TemperatureStats temperatures={temperatures} now={new Date(now)} />
      )}

      <div ref={formRef} className="scroll-mt-3">
        <TemperatureForm
          key={editing?.id ?? "new"}
          editing={editing}
          lastSite={temperatures[0]?.site ?? null}
          onDone={() => setEditing(null)}
        />
      </div>

      {now === null ? (
        <Skeleton className="h-40" />
      ) : (
        <TemperatureList temperatures={temperatures} now={new Date(now)} onEdit={startEditing} />
      )}

      {hasOlder && (
        <div className="text-center">
          <Link href={`/temperature?days=${days + 30}`} scroll={false} className={softButtonClass}>
            Показать ещё 30 дней
          </Link>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted">
        Не заменяет консультацию педиатра. Температура ≥ 38 °C у младенца до 3 месяцев — повод
        срочно обратиться к врачу.
      </p>
    </>
  );
}

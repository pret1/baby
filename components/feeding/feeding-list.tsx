"use client";

import { deleteFeeding } from "@/lib/actions/feedings";
import type { FeedingWithInterval } from "@/lib/feedings";
import { BREAST_SIDE_LABELS, FEEDING_TYPE_LABELS } from "@/lib/labels";
import { formatDayLabel, formatDuration, formatTime, groupByDay, plural } from "@/lib/time";
import { RowActions } from "../row-actions";
import { Card, EmptyState, Tag } from "../ui";

export function FeedingList({
  feedings,
  now,
  onEdit,
}: {
  feedings: FeedingWithInterval[];
  now: Date;
  onEdit: (feeding: FeedingWithInterval) => void;
}) {
  if (feedings.length === 0) return <EmptyState>Пока нет записей</EmptyState>;

  return (
    <Card className="pt-1">
      {groupByDay(feedings, (f) => f.startedAt).map((day) => {
        const volume = day.items.reduce((sum, f) => sum + (f.volumeMl ?? 0), 0);
        return (
          <section key={day.key}>
            <h3 className="mt-3 mb-1 text-[13px] font-bold text-muted">
              {formatDayLabel(day.date, now)} · {day.items.length}{" "}
              {plural(day.items.length, "кормление", "кормления", "кормлений")}
              {volume > 0 && ` · ${volume} мл`}
            </h3>
            <ul>
              {day.items.map((feeding) => (
                <FeedingRow key={feeding.id} feeding={feeding} onEdit={() => onEdit(feeding)} />
              ))}
            </ul>
          </section>
        );
      })}
    </Card>
  );
}

function FeedingRow({ feeding, onEdit }: { feeding: FeedingWithInterval; onEdit: () => void }) {
  return (
    <li className="flex flex-wrap items-start gap-x-2.5 border-t border-line py-2">
      <time dateTime={feeding.startedAt.toISOString()} className="min-w-11 pt-0.5 font-bold">
        {formatTime(feeding.startedAt)}
      </time>
      <div className="min-w-0 flex-1">
        <Tag>
          {FEEDING_TYPE_LABELS[feeding.type]}
          {feeding.breastSide && ` · ${BREAST_SIDE_LABELS[feeding.breastSide].toLowerCase()}`}
        </Tag>
        {feeding.volumeMl != null && <Tag>{feeding.volumeMl} мл</Tag>}
        {feeding.durationMin != null && <Tag>{feeding.durationMin} мин</Tag>}
        {feeding.intervalMs != null && (
          <Tag tone="ok">интервал {formatDuration(feeding.intervalMs)}</Tag>
        )}
        {feeding.note && <p className="text-sm break-words text-muted">{feeding.note}</p>}
      </div>
      <RowActions onEdit={onEdit} onDelete={() => deleteFeeding(feeding.id)} />
    </li>
  );
}

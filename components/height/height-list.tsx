"use client";

import { deleteHeight } from "@/lib/actions/heights";
import type { Height } from "@/lib/db/schema";
import { formatCm, formatSigned } from "@/lib/format";
import type { HeightRow } from "@/lib/heights";
import { formatDateTime } from "@/lib/time";
import { RowActions } from "../row-actions";
import { Card, Tag } from "../ui";

export function HeightList({ rows, onEdit }: { rows: HeightRow[]; onEdit: (h: Height) => void }) {
  return (
    <Card className="py-1">
      <h2 className="mt-2 mb-1 text-[13px] font-bold text-muted">История</h2>
      <ul>
        {rows.map((row) => {
          const height = row.height;
          return (
            <li
              key={height?.id ?? "birth"}
              className="flex flex-wrap items-start gap-x-2.5 border-t border-line py-2"
            >
              <time
                dateTime={row.measuredAt.toISOString()}
                className="min-w-24 pt-0.5 text-sm font-bold"
              >
                {formatDateTime(row.measuredAt)}
              </time>
              <div className="min-w-0 flex-1">
                <Tag>{formatCm(row.cm)}</Tag>
                {!height && <Tag>при рождении</Tag>}
                {row.change && (
                  <Tag tone={row.change.cm < 0 ? "warn" : "ok"}>
                    {formatSigned(row.change.cm, 1)} см
                    {row.change.cmPerMonth !== null &&
                      ` · ${formatSigned(row.change.cmPerMonth, 1)} см/мес`}
                  </Tag>
                )}
                {height?.note && <p className="text-sm break-words text-muted">{height.note}</p>}
              </div>
              {height && (
                <RowActions onEdit={() => onEdit(height)} onDelete={() => deleteHeight(height.id)} />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

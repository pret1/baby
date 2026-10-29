"use client";

import { deleteWeight } from "@/lib/actions/weights";
import type { Weight } from "@/lib/db/schema";
import { formatGrams, formatSigned } from "@/lib/format";
import { formatDateTime } from "@/lib/time";
import type { WeightRow } from "@/lib/weights";
import { RowActions } from "../row-actions";
import { Card, Tag } from "../ui";

export function WeightList({ rows, onEdit }: { rows: WeightRow[]; onEdit: (w: Weight) => void }) {
  return (
    <Card className="py-1">
      <h2 className="mt-2 mb-1 text-[13px] font-bold text-muted">История</h2>
      <ul>
        {rows.map((row) => {
          const weight = row.weight;
          return (
            <li
              key={weight?.id ?? "birth"}
              className="flex flex-wrap items-start gap-x-2.5 border-t border-line py-2"
            >
              <time
                dateTime={row.measuredAt.toISOString()}
                className="min-w-24 pt-0.5 text-sm font-bold"
              >
                {formatDateTime(row.measuredAt)}
              </time>
              <div className="min-w-0 flex-1">
                <Tag>{formatGrams(row.grams)}</Tag>
                {!weight && <Tag>при рождении</Tag>}
                {weight?.beforeFeeding && <Tag>до кормления</Tag>}
                {weight?.afterFeeding && <Tag>после кормления</Tag>}
                {weight?.freshDiaper && <Tag>свежий подгузник</Tag>}
                {row.change && (
                  <Tag tone={row.change.grams < 0 ? "warn" : "ok"}>
                    {formatSigned(row.change.grams)} г
                    {row.change.gramsPerDay !== null &&
                      ` · ${formatSigned(row.change.gramsPerDay)} г/сут`}
                  </Tag>
                )}
                {weight?.note && <p className="text-sm break-words text-muted">{weight.note}</p>}
              </div>
              {weight && (
                <RowActions onEdit={() => onEdit(weight)} onDelete={() => deleteWeight(weight.id)} />
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

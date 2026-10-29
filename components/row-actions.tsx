"use client";

import { useState, useTransition } from "react";
import { callAction, type ActionResult } from "@/lib/action-result";
import { softButtonClass } from "./ui";

/**
 * Кнопки «изменить» и «удалить» для строки списка. Удаление подтверждается
 * второй кнопкой (без системного confirm). Возвращает фрагмент: строка списка
 * должна быть `flex flex-wrap`, чтобы ошибка встала на всю ширину под записью.
 */
export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => Promise<ActionResult>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () =>
    startTransition(async () => {
      setError(null);
      const result = await callAction(onDelete);
      if (!result.ok) setError(result.error);
    });

  const cancel = () => {
    setConfirming(false);
    setError(null);
  };

  return (
    <>
      {confirming ? (
        <div className="flex flex-none gap-1">
          <button type="button" onClick={cancel} className={softButtonClass}>
            Нет
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded-lg bg-bad px-2.5 py-1.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Удаляю…" : error ? "Повторить" : "Удалить"}
          </button>
        </div>
      ) : (
        <div className="flex flex-none">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Изменить запись"
            className="rounded-lg px-2 py-1 text-muted"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Удалить запись"
            className="rounded-lg px-2 py-1 text-xl leading-none text-muted"
          >
            ×
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="basis-full text-right text-xs text-bad">
          {error}
        </p>
      )}
    </>
  );
}

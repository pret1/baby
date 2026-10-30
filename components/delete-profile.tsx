"use client";

import { useState, useTransition } from "react";
import { callAction } from "@/lib/action-result";
import { deleteChild } from "@/lib/actions/child";
import { Card, CardTitle, ErrorText, cn, softButtonClass } from "./ui";

export function DeleteProfile() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () =>
    startTransition(async () => {
      setError(null);
      const result = await callAction(deleteChild);
      if (!result.ok) setError(result.error);
    });

  return (
    <Card>
      <CardTitle>Удаление профиля</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Удалит профиль и все записи о кормлениях, весе, росте и температуре — на всех устройствах.
        Отменить нельзя.
      </p>
      {confirming ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className={cn(softButtonClass, "flex-1 py-3")}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="flex-1 rounded-xl bg-bad py-3 font-bold text-white disabled:opacity-60"
          >
            {pending ? "Удаляю…" : "Да, удалить всё"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 text-sm font-semibold text-bad"
        >
          Удалить профиль и все записи…
        </button>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}

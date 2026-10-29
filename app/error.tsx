"use client";

import { useEffect } from "react";
import { Card, cn, primaryButtonClass } from "@/components/ui";
import { useOnline } from "@/lib/use-online";

// Сюда попадают ошибки загрузки данных (например, БД недоступна).
// Навигация остаётся на экране, а retry() заново запрашивает данные страницы.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const online = useOnline();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mt-6 text-center">
      <p className="text-3xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-1 font-bold">Не удалось загрузить данные</h1>
      <p className="mt-1 text-sm text-muted">
        {online
          ? "Сервер или база данных сейчас недоступны. Уже сохранённые записи никуда не денутся."
          : "Нет подключения к интернету."}
      </p>
      <button type="button" onClick={() => retry()} className={cn(primaryButtonClass, "mt-4")}>
        Повторить
      </button>
    </Card>
  );
}

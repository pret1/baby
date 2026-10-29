"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnline } from "@/lib/use-online";

const MIN_REFRESH_GAP_MS = 30_000;
const REFRESH_INTERVAL_MS = 2 * 60_000;

/**
 * Синхронизация между родителями: данные перезапрашиваются, когда приложение
 * снова на экране (телефон разблокировали, вернулись во вкладку), когда вернулась
 * сеть, и раз в 2 минуты, пока страница открыта. Введённое в формах не теряется —
 * обновляются только данные с сервера.
 */
export function ConnectionWatcher() {
  const router = useRouter();
  const online = useOnline();

  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (Date.now() - lastRefresh < MIN_REFRESH_GAP_MS) return;
      lastRefresh = Date.now();
      router.refresh();
    };

    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [router]);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-xl px-3.5"
    >
      <p className="rounded-xl bg-fg px-3 py-2 text-center text-sm text-bg shadow-lg">
        Нет подключения к интернету. Новые записи не сохранятся, пока связь не вернётся.
      </p>
    </div>
  );
}

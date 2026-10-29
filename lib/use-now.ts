"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

let snapshot = 0;

// Обновляем «сейчас» по таймеру и при возвращении в приложение (телефон
// разблокировали) — чтобы «прошло с последнего кормления» не застывало.
function subscribe(onChange: () => void) {
  const update = () => {
    snapshot = Date.now();
    onChange();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") update();
  };
  update();
  const timer = setInterval(update, TICK_MS);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/**
 * Текущее время (мс) или `null` на сервере и во время гидратации.
 * Всё, что зависит от часового пояса телефона, рендерим только когда значение не `null`,
 * иначе HTML с сервера (UTC) не совпадёт с клиентом.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot || null,
    () => null,
  );
}

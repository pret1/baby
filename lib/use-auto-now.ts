"use client";

import { useEffect } from "react";
import { toLocalInput } from "./time";
import { useNow } from "./use-now";

/**
 * Время новой записи равно «сейчас» и обновляется само, пока `enabled`:
 * страница могла быть открыта несколько часов назад. Формы выключают
 * автообновление, когда время поменяли руками или отправка не удалась
 * (при повторе запись не должна «уехать» на текущее время).
 */
export function useAutoNow(sync: (value: string) => void, enabled: boolean) {
  const now = useNow();
  useEffect(() => {
    if (enabled && now !== null) sync(toLocalInput(new Date(now)));
  }, [enabled, now, sync]);
}

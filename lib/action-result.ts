export type ActionResult = { ok: true } | { ok: false; error: string };

export const NETWORK_ERROR =
  "Нет связи с сервером — изменения не сохранены. Проверьте интернет и попробуйте ещё раз.";

/**
 * Вызов Server Action с клиента. Если запрос не дошёл до сервера (нет сети),
 * промис отклоняется — превращаем это в обычный результат с ошибкой,
 * чтобы форма показала сообщение, а не упала.
 */
export async function callAction(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action();
  } catch (err) {
    console.error(err);
    return { ok: false, error: NETWORK_ERROR };
  }
}

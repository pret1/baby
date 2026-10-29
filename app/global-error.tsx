"use client";

// Последний рубеж: ошибка в корневом layout. Стили приложения здесь недоступны,
// поэтому оформление минимальное и встроенное.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 480,
          margin: "48px auto",
          padding: 16,
          textAlign: "center",
        }}
      >
        <title>Дневник малыша — ошибка</title>
        <h1 style={{ fontSize: 20 }}>Что-то пошло не так</h1>
        <p>Приложение не смогло загрузиться. Проверьте интернет и попробуйте ещё раз.</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: 0,
            background: "#e07a5f",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          Повторить
        </button>
      </body>
    </html>
  );
}

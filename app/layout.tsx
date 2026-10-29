import type { Metadata, Viewport } from "next";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Дневник малыша", template: "%s · Дневник малыша" },
  description: "Кормления, вес и температура малыша",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1a18" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body className="min-h-dvh font-sans antialiased">
        <main className="mx-auto max-w-xl px-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-24">
          {children}
        </main>
        <AppNav />
      </body>
    </html>
  );
}

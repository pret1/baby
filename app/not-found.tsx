import Link from "next/link";
import { Card, cn, primaryButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <Card className="mt-6 text-center">
      <h1 className="font-bold">Страница не найдена</h1>
      <p className="mt-1 text-sm text-muted">Возможно, ссылка устарела.</p>
      <Link href="/" className={cn(primaryButtonClass, "mt-4 block")}>
        На главную
      </Link>
    </Card>
  );
}

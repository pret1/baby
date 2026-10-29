import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card } from "@/components/ui";
import { requireChild } from "@/lib/db/queries";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const child = await requireChild();

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <Card>
        <p className="text-sm text-muted">Сводка появится, когда будут добавлены разделы.</p>
      </Card>
    </>
  );
}

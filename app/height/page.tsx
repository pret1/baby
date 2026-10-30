import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { HeightView } from "@/components/height/height-view";
import { PageSkeleton } from "@/components/page-skeleton";
import { getHeights, requireChild } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Рост" };

export default function HeightPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HeightContent />
    </Suspense>
  );
}

async function HeightContent() {
  const child = await requireChild();
  const heights = await getHeights(child.id);

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <HeightView
        child={{ birthDate: child.birthDate, birthHeightCm: child.birthHeightCm }}
        heights={heights}
      />
    </>
  );
}

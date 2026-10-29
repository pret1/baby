import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { WeightView } from "@/components/weight/weight-view";
import { getWeights, requireChild } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Вес" };

export default function WeightPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WeightContent />
    </Suspense>
  );
}

async function WeightContent() {
  const child = await requireChild();
  const weights = await getWeights(child.id);

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <WeightView
        child={{ birthDate: child.birthDate, birthWeightGrams: child.birthWeightGrams }}
        weights={weights}
      />
    </>
  );
}

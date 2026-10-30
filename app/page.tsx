import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { HomeSummary } from "@/components/home/home-summary";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  getFeedings,
  getHeights,
  getTemperatures,
  getWeights,
  requireChild,
} from "@/lib/db/queries";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const child = await requireChild();
  // Двое суток с запасом покрывают «сегодня» и «последние 24 ч» в любом часовом поясе.
  const [feedingData, weights, heights, temperatureData] = await Promise.all([
    getFeedings(child.id, 2),
    getWeights(child.id),
    getHeights(child.id),
    getTemperatures(child.id, 2),
  ]);

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <HomeSummary
        child={{
          birthDate: child.birthDate,
          birthWeightGrams: child.birthWeightGrams,
          birthHeightCm: child.birthHeightCm,
        }}
        feedings={feedingData.feedings}
        previousFeeding={feedingData.previous}
        weights={weights}
        heights={heights}
        temperatures={temperatureData.temperatures}
      />
    </>
  );
}

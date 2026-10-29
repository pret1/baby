import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { FeedingView } from "@/components/feeding/feeding-view";
import { PageSkeleton } from "@/components/page-skeleton";
import { getFeedings, requireChild } from "@/lib/db/queries";
import { parseDays } from "@/lib/search-params";

export const metadata: Metadata = { title: "Кормление" };

export default function FeedingPage({ searchParams }: PageProps<"/feeding">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FeedingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FeedingContent({ searchParams }: Pick<PageProps<"/feeding">, "searchParams">) {
  const child = await requireChild();
  const days = parseDays((await searchParams).days);
  const { feedings, previous } = await getFeedings(child.id, days);

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <FeedingView feedings={feedings} previous={previous} days={days} />
    </>
  );
}

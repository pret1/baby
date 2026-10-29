import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { TemperatureView } from "@/components/temperature/temperature-view";
import { getTemperatures, requireChild } from "@/lib/db/queries";
import { parseDays } from "@/lib/search-params";

export const metadata: Metadata = { title: "Температура" };

export default function TemperaturePage({ searchParams }: PageProps<"/temperature">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TemperatureContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TemperatureContent({
  searchParams,
}: Pick<PageProps<"/temperature">, "searchParams">) {
  const child = await requireChild();
  const days = parseDays((await searchParams).days);
  const { temperatures, hasOlder } = await getTemperatures(child.id, days);

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} />
      <TemperatureView temperatures={temperatures} hasOlder={hasOlder} days={days} />
    </>
  );
}

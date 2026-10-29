import type { Metadata } from "next";
import { Suspense } from "react";
import { ChildHeader } from "@/components/child-header";
import { DeleteProfile } from "@/components/delete-profile";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProfileForm } from "@/components/profile-form";
import { getChild } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Профиль" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const child = await getChild();

  if (!child) {
    return (
      <>
        <header className="mb-3">
          <h1 className="text-xl font-bold">Дневник малыша</h1>
          <p className="text-sm text-muted">
            Для начала заполните профиль — его увидят оба родителя.
          </p>
        </header>
        {/* key: после удаления профиля форма должна пересоздаться пустой */}
        <ProfileForm key="new" child={null} />
      </>
    );
  }

  return (
    <>
      <ChildHeader name={child.name} birthDate={child.birthDate} showProfileLink={false} />
      <ProfileForm
        key={child.id}
        child={{
          name: child.name,
          birthDate: child.birthDate,
          birthWeightGrams: child.birthWeightGrams,
        }}
      />
      <DeleteProfile />
    </>
  );
}

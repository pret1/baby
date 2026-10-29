"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { callAction } from "@/lib/action-result";
import { saveChild } from "@/lib/actions/child";
import type { Child } from "@/lib/db/schema";
import { toLocalInput } from "@/lib/time";
import { childFormSchema } from "@/lib/validation";
import { Card, CardTitle, ErrorText, Field, cn, inputClass, primaryButtonClass } from "./ui";

type ProfileValues = Pick<Child, "name" | "birthDate" | "birthWeightGrams">;

export function ProfileForm({ child }: { child: ProfileValues | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: child?.name ?? "",
      birthDate: child ? toLocalInput(child.birthDate) : "",
      birthWeightGrams: child ? String(child.birthWeightGrams) : "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await callAction(() => saveChild(values));
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/");
  });

  return (
    <Card>
      <CardTitle>{child ? "Профиль малыша" : "Расскажите о малыше"}</CardTitle>
      <form onSubmit={onSubmit} noValidate>
        <Field label="Имя" error={errors.name?.message}>
          <input
            className={inputClass}
            autoComplete="off"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <div className="flex flex-wrap gap-x-2">
          <Field
            label="Дата и время рождения"
            error={errors.birthDate?.message}
            className="grow basis-48"
          >
            <input
              type="datetime-local"
              className={inputClass}
              aria-invalid={!!errors.birthDate}
              {...register("birthDate")}
            />
          </Field>
          <Field
            label="Вес при рождении, г"
            error={errors.birthWeightGrams?.message}
            className="grow basis-28"
          >
            <input
              type="number"
              inputMode="numeric"
              placeholder="3400"
              className={inputClass}
              aria-invalid={!!errors.birthWeightGrams}
              {...register("birthWeightGrams")}
            />
          </Field>
        </div>
        {serverError && <ErrorText>{serverError}</ErrorText>}
        <button type="submit" disabled={isSubmitting} className={cn(primaryButtonClass, "mt-3")}>
          {isSubmitting ? "Сохраняю…" : "Сохранить"}
        </button>
      </form>
    </Card>
  );
}

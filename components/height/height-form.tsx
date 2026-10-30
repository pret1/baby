"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { callAction } from "@/lib/action-result";
import { createHeight, updateHeight } from "@/lib/actions/heights";
import type { Height } from "@/lib/db/schema";
import { toLocalInput } from "@/lib/time";
import { useAutoNow } from "@/lib/use-auto-now";
import { heightFormSchema, type HeightFormValues } from "@/lib/validation";
import {
  Card,
  CardTitle,
  ErrorText,
  Field,
  cn,
  inputClass,
  primaryButtonClass,
  softButtonClass,
} from "../ui";

const emptyValues: HeightFormValues = { measuredAt: "", heightCm: "", note: "" };

function valuesFrom(height: Height): HeightFormValues {
  return {
    measuredAt: toLocalInput(height.measuredAt),
    heightCm: String(height.heightCm).replace(".", ","),
    note: height.note ?? "",
  };
}

export function HeightForm({ editing, onDone }: { editing: Height | null; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(heightFormSchema),
    defaultValues: editing ? valuesFrom(editing) : emptyValues,
  });

  // Время новой записи — «сейчас», пока его не меняли руками и не было неудачной отправки.
  const [timeLocked, setTimeLocked] = useState(false);
  const syncTime = useCallback((value: string) => setValue("measuredAt", value), [setValue]);
  useAutoNow(syncTime, !editing && !timeLocked && dirtyFields.measuredAt !== true);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await callAction(() =>
      editing ? updateHeight(editing.id, values) : createHeight(values),
    );
    if (!result.ok) {
      setServerError(result.error);
      setTimeLocked(true);
      return;
    }
    setTimeLocked(false);
    if (editing) onDone();
    else reset({ ...emptyValues, measuredAt: toLocalInput(new Date()) });
  });

  return (
    <Card>
      <CardTitle>{editing ? "Изменить измерение" : "Новое измерение"}</CardTitle>
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap gap-x-2">
          <Field label="Рост, см" error={errors.heightCm?.message} className="grow basis-28">
            <input
              inputMode="decimal"
              placeholder="54,5"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.heightCm}
              {...register("heightCm")}
            />
          </Field>
          <Field label="Время" error={errors.measuredAt?.message} className="grow basis-60">
            <div className="flex gap-2">
              <input
                type="datetime-local"
                className={inputClass}
                aria-invalid={!!errors.measuredAt}
                {...register("measuredAt")}
              />
              <button
                type="button"
                className={cn(softButtonClass, "flex-none")}
                onClick={() => {
                  resetField("measuredAt", { defaultValue: toLocalInput(new Date()) });
                  setTimeLocked(false);
                }}
              >
                Сейчас
              </button>
            </div>
          </Field>
        </div>

        <Field label="Заметка" error={errors.note?.message}>
          <input
            className={inputClass}
            placeholder="у педиатра, дома…"
            {...register("note")}
          />
        </Field>

        {serverError && <ErrorText>{serverError}</ErrorText>}

        <div className="mt-3 flex gap-2">
          {editing && (
            <button type="button" onClick={onDone} className={cn(softButtonClass, "px-4")}>
              Отмена
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? "Сохраняю…" : editing ? "Сохранить" : "Записать рост"}
          </button>
        </div>
        {!editing && (
          <p className="mt-1.5 text-xs text-muted">
            Малышей измеряют лёжа: от макушки до пяток, ножки выпрямлены.
          </p>
        )}
      </form>
    </Card>
  );
}

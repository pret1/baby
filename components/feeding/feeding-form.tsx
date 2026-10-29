"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { callAction } from "@/lib/action-result";
import { createFeeding, updateFeeding } from "@/lib/actions/feedings";
import type { Feeding } from "@/lib/db/schema";
import { BREAST_SIDE_LABELS, FEEDING_TYPE_LABELS } from "@/lib/labels";
import { toLocalInput } from "@/lib/time";
import { useAutoNow } from "@/lib/use-auto-now";
import {
  BREAST_SIDES,
  FEEDING_TYPES,
  feedingFormSchema,
  type FeedingFormValues,
} from "@/lib/validation";
import { Segmented } from "../segmented";
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

const typeOptions = FEEDING_TYPES.map((value) => ({ value, label: FEEDING_TYPE_LABELS[value] }));
const sideOptions = BREAST_SIDES.map((value) => ({ value, label: BREAST_SIDE_LABELS[value] }));

function valuesFrom(feeding: Feeding): FeedingFormValues {
  return {
    startedAt: toLocalInput(feeding.startedAt),
    type: feeding.type,
    breastSide: feeding.breastSide ?? "left",
    volumeMl: feeding.volumeMl?.toString() ?? "",
    durationMin: feeding.durationMin?.toString() ?? "",
    note: feeding.note ?? "",
  };
}

export function FeedingForm({
  editing,
  lastFeeding,
  onDone,
}: {
  /** Редактируемая запись; null — форма добавления нового кормления. */
  editing: Feeding | null;
  /** Последнее кормление: его тип и сторона подставляются по умолчанию. */
  lastFeeding: Feeding | null;
  onDone: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    resetField,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(feedingFormSchema),
    defaultValues: editing
      ? valuesFrom(editing)
      : {
          startedAt: "",
          type: lastFeeding?.type ?? "breast",
          breastSide: lastFeeding?.breastSide ?? "left",
          volumeMl: "",
          durationMin: "",
          note: "",
        },
  });

  // Время новой записи — «сейчас», пока его не меняли руками и не было неудачной отправки.
  const [timeLocked, setTimeLocked] = useState(false);
  const syncTime = useCallback((value: string) => setValue("startedAt", value), [setValue]);
  useAutoNow(syncTime, !editing && !timeLocked && dirtyFields.startedAt !== true);

  const type = useWatch({ control, name: "type" });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await callAction(() =>
      editing ? updateFeeding(editing.id, values) : createFeeding(values),
    );
    if (!result.ok) {
      setServerError(result.error);
      setTimeLocked(true);
      return;
    }
    setTimeLocked(false);
    if (editing) {
      onDone();
    } else {
      reset({
        startedAt: toLocalInput(new Date()),
        type: values.type,
        breastSide: getValues("breastSide"),
        volumeMl: "",
        durationMin: "",
        note: "",
      });
    }
  });

  return (
    <Card>
      <CardTitle>{editing ? "Изменить кормление" : "Новое кормление"}</CardTitle>
      <form onSubmit={onSubmit} noValidate>
        <Field label="Начало кормления" error={errors.startedAt?.message}>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              className={inputClass}
              aria-invalid={!!errors.startedAt}
              {...register("startedAt")}
            />
            <button
              type="button"
              className={cn(softButtonClass, "flex-none")}
              onClick={() => {
                resetField("startedAt", { defaultValue: toLocalInput(new Date()) });
                setTimeLocked(false);
              }}
            >
              Сейчас
            </button>
          </div>
        </Field>

        <Segmented label="Тип" options={typeOptions} registration={register("type")} />

        {type === "breast" ? (
          <>
            <Segmented label="Грудь" options={sideOptions} registration={register("breastSide")} />
            {errors.breastSide && <ErrorText>{errors.breastSide.message}</ErrorText>}
          </>
        ) : null}

        <div className="flex gap-2">
          {type !== "breast" && (
            <Field label="Объём, мл" error={errors.volumeMl?.message} className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="90"
                className={inputClass}
                aria-invalid={!!errors.volumeMl}
                {...register("volumeMl")}
              />
            </Field>
          )}
          <Field label="Длительность, мин" error={errors.durationMin?.message} className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              placeholder="необязательно"
              className={inputClass}
              aria-invalid={!!errors.durationMin}
              {...register("durationMin")}
            />
          </Field>
        </div>

        <Field label="Заметка" error={errors.note?.message}>
          <input
            className={inputClass}
            placeholder="срыгивание, беспокойство…"
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
            {isSubmitting ? "Сохраняю…" : editing ? "Сохранить" : "Записать кормление"}
          </button>
        </div>
        {!editing && (
          <p className="mt-1.5 text-xs text-muted">
            Достаточно указать начало — интервал до предыдущего кормления посчитается сам.
          </p>
        )}
      </form>
    </Card>
  );
}

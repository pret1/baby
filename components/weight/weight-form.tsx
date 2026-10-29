"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { callAction } from "@/lib/action-result";
import { createWeight, updateWeight } from "@/lib/actions/weights";
import type { Weight } from "@/lib/db/schema";
import { toLocalInput } from "@/lib/time";
import { useAutoNow } from "@/lib/use-auto-now";
import { weightFormSchema, type WeightFormValues } from "@/lib/validation";
import {
  Card,
  CardTitle,
  Checkbox,
  ErrorText,
  Field,
  cn,
  inputClass,
  primaryButtonClass,
  softButtonClass,
} from "../ui";

const emptyValues: WeightFormValues = {
  measuredAt: "",
  weightGrams: "",
  beforeFeeding: false,
  afterFeeding: false,
  freshDiaper: false,
  note: "",
};

function valuesFrom(weight: Weight): WeightFormValues {
  return {
    measuredAt: toLocalInput(weight.measuredAt),
    weightGrams: String(weight.weightGrams),
    beforeFeeding: weight.beforeFeeding,
    afterFeeding: weight.afterFeeding,
    freshDiaper: weight.freshDiaper,
    note: weight.note ?? "",
  };
}

export function WeightForm({ editing, onDone }: { editing: Weight | null; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(weightFormSchema),
    defaultValues: editing ? valuesFrom(editing) : emptyValues,
  });

  // Время новой записи — «сейчас», пока его не меняли руками и не было неудачной отправки.
  const [timeLocked, setTimeLocked] = useState(false);
  const syncTime = useCallback((value: string) => setValue("measuredAt", value), [setValue]);
  useAutoNow(syncTime, !editing && !timeLocked && dirtyFields.measuredAt !== true);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await callAction(() =>
      editing ? updateWeight(editing.id, values) : createWeight(values),
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
      <CardTitle>{editing ? "Изменить взвешивание" : "Новое взвешивание"}</CardTitle>
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap gap-x-2">
          <Field label="Вес, г" error={errors.weightGrams?.message} className="grow basis-28">
            <input
              type="number"
              inputMode="numeric"
              placeholder="3650"
              className={inputClass}
              aria-invalid={!!errors.weightGrams}
              {...register("weightGrams")}
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

        {/* «До» и «после» кормления взаимоисключающие: отметка одного снимает другое. */}
        <Checkbox
          label="До кормления"
          {...register("beforeFeeding", {
            onChange: (e) => e.target.checked && setValue("afterFeeding", false),
          })}
        />
        <Checkbox
          label="После кормления"
          {...register("afterFeeding", {
            onChange: (e) => e.target.checked && setValue("beforeFeeding", false),
          })}
        />
        {errors.afterFeeding && <ErrorText>{errors.afterFeeding.message}</ErrorText>}
        <Checkbox label="Со свежим подгузником" {...register("freshDiaper")} />

        <Field label="Заметка" error={errors.note?.message}>
          <input className={inputClass} {...register("note")} />
        </Field>

        {serverError && <ErrorText>{serverError}</ErrorText>}

        <div className="mt-3 flex gap-2">
          {editing && (
            <button type="button" onClick={onDone} className={cn(softButtonClass, "px-4")}>
              Отмена
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? "Сохраняю…" : editing ? "Сохранить" : "Записать вес"}
          </button>
        </div>
        {!editing && (
          <p className="mt-1.5 text-xs text-muted">
            Сравнивайте вес в одинаковых условиях: до/после еды, с подгузником или без.
          </p>
        )}
      </form>
    </Card>
  );
}

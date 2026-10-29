"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { callAction } from "@/lib/action-result";
import { createTemperature, updateTemperature } from "@/lib/actions/temperatures";
import type { Temperature } from "@/lib/db/schema";
import { TEMPERATURE_SITE_LABELS } from "@/lib/labels";
import { toLocalInput } from "@/lib/time";
import { useAutoNow } from "@/lib/use-auto-now";
import {
  TEMPERATURE_SITES,
  temperatureFormSchema,
  type TemperatureFormValues,
} from "@/lib/validation";
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

function valuesFrom(t: Temperature): TemperatureFormValues {
  return {
    measuredAt: toLocalInput(t.measuredAt),
    valueCelsius: t.valueCelsius.toFixed(1).replace(".", ","),
    site: t.site,
    note: t.note ?? "",
  };
}

export function TemperatureForm({
  editing,
  lastSite,
  onDone,
}: {
  editing: Temperature | null;
  /** Место последнего измерения — подставляется по умолчанию. */
  lastSite: Temperature["site"] | null;
  onDone: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(temperatureFormSchema),
    defaultValues: editing
      ? valuesFrom(editing)
      : { measuredAt: "", valueCelsius: "", site: lastSite ?? "armpit", note: "" },
  });

  // Время новой записи — «сейчас», пока его не меняли руками и не было неудачной отправки.
  const [timeLocked, setTimeLocked] = useState(false);
  const syncTime = useCallback((value: string) => setValue("measuredAt", value), [setValue]);
  useAutoNow(syncTime, !editing && !timeLocked && dirtyFields.measuredAt !== true);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await callAction(() =>
      editing ? updateTemperature(editing.id, values) : createTemperature(values),
    );
    if (!result.ok) {
      setServerError(result.error);
      setTimeLocked(true);
      return;
    }
    setTimeLocked(false);
    if (editing) onDone();
    else
      reset({
        measuredAt: toLocalInput(new Date()),
        valueCelsius: "",
        site: getValues("site"),
        note: "",
      });
  });

  return (
    <Card>
      <CardTitle>{editing ? "Изменить измерение" : "Новое измерение"}</CardTitle>
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap gap-x-2">
          <Field
            label="Температура, °C"
            error={errors.valueCelsius?.message}
            className="grow basis-28"
          >
            <input
              inputMode="decimal"
              placeholder="36,6"
              autoComplete="off"
              className={inputClass}
              aria-invalid={!!errors.valueCelsius}
              {...register("valueCelsius")}
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

        <Field label="Где измеряли" error={errors.site?.message}>
          <select className={inputClass} {...register("site")}>
            {TEMPERATURE_SITES.map((site) => (
              <option key={site} value={site}>
                {TEMPERATURE_SITE_LABELS[site]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Заметка" error={errors.note?.message}>
          <input
            className={inputClass}
            placeholder="лекарство, самочувствие…"
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
            {isSubmitting ? "Сохраняю…" : editing ? "Сохранить" : "Записать температуру"}
          </button>
        </div>
      </form>
    </Card>
  );
}

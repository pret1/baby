import type { UseFormRegisterReturn } from "react-hook-form";

/** Группа радиокнопок в виде переключателя — быстрее выбора из списка на телефоне. */
export function Segmented({
  label,
  options,
  registration,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  registration: UseFormRegisterReturn;
}) {
  return (
    <fieldset className="mt-2 min-w-0">
      <legend className="mb-1 text-[13px] text-muted">{label}</legend>
      <div className="flex gap-1 rounded-xl border border-line bg-bg p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex-1 cursor-pointer rounded-lg px-1 py-2 text-center text-sm font-semibold text-muted has-checked:bg-accent has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input type="radio" value={option.value} className="sr-only" {...registration} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

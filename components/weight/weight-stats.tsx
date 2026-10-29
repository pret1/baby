import { formatGrams, formatPeriod, formatSigned } from "@/lib/format";
import { formatDate } from "@/lib/time";
import { weightStats, type WeightPoint } from "@/lib/weights";
import { Stat, StatGrid, type Tone } from "../ui";

const toneFor = (grams: number): Tone => (grams < 0 ? "warn" : "ok");

export function WeightStats({ points }: { points: WeightPoint[] }) {
  const { latest, sincePrevious, sinceBirth } = weightStats(points);

  if (!latest) {
    return (
      <StatGrid>
        <Stat value={formatGrams(points[0].grams)} label="при рождении" />
        <Stat value="—" label="взвешиваний пока нет" />
      </StatGrid>
    );
  }

  return (
    <StatGrid>
      <Stat value={formatGrams(latest.grams)} label={`последний вес · ${formatDate(latest.measuredAt)}`} />
      {sincePrevious && (
        <Stat
          value={`${formatSigned(sincePrevious.grams)} г`}
          tone={toneFor(sincePrevious.grams)}
          label={`с прошлого взвешивания · ${formatPeriod(sincePrevious.days)}`}
        />
      )}
      {sincePrevious && (
        <Stat
          value={
            sincePrevious.gramsPerDay === null
              ? "—"
              : `${formatSigned(sincePrevious.gramsPerDay)} г/сут`
          }
          label={
            sincePrevious.gramsPerDay === null
              ? "прирост в сутки: прошло меньше суток"
              : "прирост в сутки с прошлого взвешивания"
          }
        />
      )}
      {sinceBirth && (
        <Stat
          value={`${formatSigned(sinceBirth.grams)} г`}
          tone={toneFor(sinceBirth.grams)}
          label={
            sinceBirth.gramsPerDay === null
              ? "с рождения"
              : `с рождения · в среднем ${formatSigned(sinceBirth.gramsPerDay)} г/сут`
          }
        />
      )}
    </StatGrid>
  );
}

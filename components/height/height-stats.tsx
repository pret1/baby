import { formatCm, formatPeriod, formatSigned } from "@/lib/format";
import { heightStats, type HeightPoint } from "@/lib/heights";
import { formatDate } from "@/lib/time";
import { Stat, StatGrid, type Tone } from "../ui";

// Рост не уменьшается — минус почти всегда означает погрешность измерения.
const toneFor = (cm: number): Tone => (cm < 0 ? "warn" : "ok");

export function HeightStats({ points }: { points: HeightPoint[] }) {
  const { latest, sincePrevious, sinceBirth } = heightStats(points);

  if (!latest) {
    const birth = points.find((p) => p.height === null);
    return (
      <StatGrid>
        <Stat
          value={birth ? formatCm(birth.cm) : "—"}
          label={birth ? "при рождении" : "рост при рождении не указан"}
        />
        <Stat value="—" label="измерений пока нет" />
      </StatGrid>
    );
  }

  return (
    <StatGrid>
      <Stat value={formatCm(latest.cm)} label={`последний рост · ${formatDate(latest.measuredAt)}`} />
      {sincePrevious && (
        <Stat
          value={`${formatSigned(sincePrevious.cm, 1)} см`}
          tone={toneFor(sincePrevious.cm)}
          label={`с прошлого измерения · ${formatPeriod(sincePrevious.days)}`}
        />
      )}
      {sincePrevious && (
        <Stat
          value={
            sincePrevious.cmPerMonth === null
              ? "—"
              : `${formatSigned(sincePrevious.cmPerMonth, 1)} см/мес`
          }
          label={
            sincePrevious.cmPerMonth === null
              ? "прирост в месяц: прошло меньше 2 недель"
              : "прирост в месяц с прошлого измерения"
          }
        />
      )}
      {sinceBirth && (
        <Stat
          value={`${formatSigned(sinceBirth.cm, 1)} см`}
          tone={toneFor(sinceBirth.cm)}
          label={
            sinceBirth.cmPerMonth === null
              ? "с рождения"
              : `с рождения · в среднем ${formatSigned(sinceBirth.cmPerMonth, 1)} см/мес`
          }
        />
      )}
    </StatGrid>
  );
}

const Y_MIN = 0.8;
const Y_MAX = 3;
const CHART_WIDTH = 520;
const CHART_HEIGHT = 190;
const LEVELS = [3, 2, 1] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeDASS21Score(score: number): number {
  // DASS-21 range is 0-42, normalized to the visual scale used by this chart.
  const normalized = Y_MIN + (score / 42) * (Y_MAX - Y_MIN);
  return Number(clamp(normalized, Y_MIN, Y_MAX).toFixed(2));
}

function scoreToY(score: number): number {
  const safeScore = clamp(score, Y_MIN, Y_MAX);
  return CHART_HEIGHT - ((safeScore - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
}

function buildPoints(values: number[]): Array<{ x: number; y: number }> {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    return [{ x: 0, y: scoreToY(values[0]) }];
  }

  const stepX = CHART_WIDTH / (values.length - 1);
  return values.map((value, index) => ({
    x: index * stepX,
    y: scoreToY(value),
  }));
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x},${points[0].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function formatDateLabel(value: string | Date): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    return value;
  }

  return "-";
}

function shouldRenderTickLabel(index: number, total: number): boolean {
  if (total <= 6) {
    return true;
  }

  const step = Math.ceil(total / 6);
  return index === 0 || index === total - 1 || index % step === 0;
}

export interface TrendData {
  anxiety_score: number;
  depression_score: number;
  stress_score: number;
  date: string | Date;
}

interface TrendOverviewProps {
  data?: TrendData[];
}

export default function TrendOverview({ data }: TrendOverviewProps) {
  // Use passed data or fallback to demo data
  let chartData = data && data.length > 0 ? data : [
    { anxiety_score: 2.25, depression_score: 1.4, stress_score: 1.8, date: "Day 1" },
    { anxiety_score: 2.15, depression_score: 0.9, stress_score: 2.3, date: "Day 2" },
    { anxiety_score: 2.05, depression_score: 1.7, stress_score: 1.25, date: "Day 3" },
    { anxiety_score: 1.9, depression_score: 2.5, stress_score: 1.95, date: "Day 4" },
    { anxiety_score: 1.2, depression_score: 2.1, stress_score: 1.85, date: "Day 5" },
  ];

  // Normalize DASS-21 scores if they're in the 0-42 range
  chartData = chartData.map((d) => ({
    ...d,
    anxiety_score: d.anxiety_score > Y_MAX ? normalizeDASS21Score(d.anxiety_score) : clamp(d.anxiety_score, Y_MIN, Y_MAX),
    depression_score:
      d.depression_score > Y_MAX ? normalizeDASS21Score(d.depression_score) : clamp(d.depression_score, Y_MIN, Y_MAX),
    stress_score: d.stress_score > Y_MAX ? normalizeDASS21Score(d.stress_score) : clamp(d.stress_score, Y_MIN, Y_MAX),
  }));

  const anxietyScores = chartData.map((d) => d.anxiety_score);
  const depressionScores = chartData.map((d) => d.depression_score);
  const stressScores = chartData.map((d) => d.stress_score);

  const dateLabels = chartData.map((d) => formatDateLabel(d.date));
  const anxietyPoints = buildPoints(anxietyScores);
  const depressionPoints = buildPoints(depressionScores);
  const stressPoints = buildPoints(stressScores);
  const hasData = chartData.length > 0;
  const xStep = chartData.length > 1 ? CHART_WIDTH / (chartData.length - 1) : 0;

  return (
    <section className="col-span-2 w-full rounded-2xl border border-[#e0e0e6] bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#ebebef] flex items-center justify-between shrink-0">
        <h2 className="text-[22px] text-[#1f1f1f] font-medium leading-none">Trend Overview</h2>
        <div className="flex items-center gap-3 text-[13px] text-[#8f8f95]">
          <span className="inline-flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f4b3b0" }} />
            Anxiety
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm inline-block" style={{ background: "#a9e9a8" }} />
            Depression
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f0bf8d" }} />
            Stress
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col">
        <svg
          viewBox="0 0 620 290"
          className="w-full flex-1"
          style={{ minHeight: 0 }}
          preserveAspectRatio="none"
          role="img"
          aria-label="Trend chart"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = 20 + i * (CHART_HEIGHT / 4);
            return <line key={y} x1="50" y1={y} x2="590" y2={y} stroke="#efeff3" strokeWidth="1" />;
          })}

          {LEVELS.map((level) => (
            <text key={level} x="6" y={20 + scoreToY(level) + 4} fontSize="13" fill="#9c9ca4">
              {`Level 0${level}`}
            </text>
          ))}

          <g transform="translate(55,20)">
            <path d={smoothPath(anxietyPoints)} fill="none" stroke="#f4b3b0" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath(depressionPoints)} fill="none" stroke="#a9e9a8" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath(stressPoints)} fill="none" stroke="#f0bf8d" strokeWidth="2.5" strokeLinecap="round" />

            {anxietyPoints.map((point, index) => (
              <circle key={`anxiety-${index}`} cx={point.x} cy={point.y} r="2.3" fill="#f4b3b0">
                <title>{`Anxiety: ${anxietyScores[index].toFixed(2)}`}</title>
              </circle>
            ))}

            {depressionPoints.map((point, index) => (
              <circle key={`depression-${index}`} cx={point.x} cy={point.y} r="2.3" fill="#a9e9a8">
                <title>{`Depression: ${depressionScores[index].toFixed(2)}`}</title>
              </circle>
            ))}

            {stressPoints.map((point, index) => (
              <circle key={`stress-${index}`} cx={point.x} cy={point.y} r="2.3" fill="#f0bf8d">
                <title>{`Stress: ${stressScores[index].toFixed(2)}`}</title>
              </circle>
            ))}
          </g>

          {hasData ? (
            dateLabels.map((label, index) =>
              shouldRenderTickLabel(index, dateLabels.length) ? (
                <text key={`${label}-${index}`} x={55 + index * xStep} y="282" fontSize="13" fill="#9c9ca4" textAnchor="middle">
                  {label}
                </text>
              ) : null,
            )
          ) : (
            <text x="310" y="160" fontSize="14" fill="#9c9ca4" textAnchor="middle">
              No trend data available
            </text>
          )}
        </svg>
      </div>
    </section>
  );
}

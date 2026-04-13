function normalizeDASS21Score(score: number): number {
  // DASS-21 range is 0-42, normalize to 0.8-3 for chart scaling
  const normalized = 0.8 + (score / 42) * (3 - 0.8);
  return Number(normalized.toFixed(2));
}

function smoothPath(values: number[]): string {
  // Handle empty or single-element arrays
  if (!values || values.length < 1) {
    return "";
  }

  if (values.length === 1) {
    return `M 0,190`;
  }

  const width = 520;
  const height = 190;
  const min = 0.8;
  const max = 3;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / (max - min)) * height,
  }));

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
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
  let chartData = data || [
    { anxiety_score: 2.25, depression_score: 1.4, stress_score: 1.8, date: "Day 1" },
    { anxiety_score: 2.15, depression_score: 0.9, stress_score: 2.3, date: "Day 2" },
    { anxiety_score: 2.05, depression_score: 1.7, stress_score: 1.25, date: "Day 3" },
    { anxiety_score: 1.9, depression_score: 2.5, stress_score: 1.95, date: "Day 4" },
    { anxiety_score: 1.2, depression_score: 2.1, stress_score: 1.85, date: "Day 5" },
  ];

  // Normalize DASS-21 scores if they're in the 0-42 range
  chartData = chartData.map((d) => ({
    ...d,
    anxiety_score: d.anxiety_score > 3 ? normalizeDASS21Score(d.anxiety_score) : d.anxiety_score,
    depression_score: d.depression_score > 3 ? normalizeDASS21Score(d.depression_score) : d.depression_score,
    stress_score: d.stress_score > 3 ? normalizeDASS21Score(d.stress_score) : d.stress_score,
  }));

  const anxietyScores = chartData.map((d) => d.anxiety_score);
  const depressionScores = chartData.map((d) => d.depression_score);
  const stressScores = chartData.map((d) => d.stress_score);

  const formatDate = (date: string | Date): string => {
    if (typeof date === "string") return date;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const dateLabels = chartData.map((d) => formatDate(d.date));

  return (
    <section className="col-span-2 w-full rounded-2xl border border-[#e0e0e6] bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#ebebef] flex items-center justify-between flex-shrink-0">
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
            const y = 20 + i * 50;
            return <line key={y} x1="50" y1={y} x2="590" y2={y} stroke="#efeff3" strokeWidth="1" />;
          })}

          <text x="6" y="68" fontSize="13" fill="#9c9ca4">Level 03</text>
          <text x="6" y="168" fontSize="13" fill="#9c9ca4">Level 02</text>
          <text x="6" y="255" fontSize="13" fill="#9c9ca4">Level 01</text>

          <g transform="translate(55,20)">
            <path d={smoothPath(anxietyScores)} fill="none" stroke="#f4b3b0" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath(depressionScores)} fill="none" stroke="#a9e9a8" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath(stressScores)} fill="none" stroke="#f0bf8d" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {dateLabels.map((d, i) => (
            <text key={d} x={62 + i * 130} y="282" fontSize="13" fill="#9c9ca4">{d}</text>
          ))}
        </svg>
      </div>
    </section>
  );
}

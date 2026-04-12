function smoothPath(values: number[]): string {
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

export default function TrendOverview() {
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
            <path d={smoothPath([2.25, 2.15, 2.05, 1.9, 1.2])} fill="none" stroke="#f4b3b0" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath([1.4, 0.9, 1.7, 2.5, 2.1])} fill="none" stroke="#a9e9a8" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath([1.8, 2.3, 1.25, 1.95, 1.85])} fill="none" stroke="#f0bf8d" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
            <text key={d} x={62 + i * 130} y="282" fontSize="13" fill="#9c9ca4">{d}</text>
          ))}
        </svg>
      </div>
    </section>
  );
}

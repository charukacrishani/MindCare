import { SummaryCard } from "./types";

interface SummaryCardsProps {
  summaryCards: SummaryCard[];
}

export default function SummaryCards({ summaryCards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {summaryCards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-[#e2e2e6] bg-white overflow-hidden"
        >
          <p className="px-4 py-2.5 text-[15px] text-[#404040] border-b border-[#e8e8ec]">
            {card.title}
          </p>
          <p className="px-4 pt-5 pb-10 leading-none">
            <span style={{ fontSize: "44px", color: "#c8c8d0", fontWeight: 700 }}>Level </span>
            <span style={{ fontSize: "60px", color: "#0f0f0f", fontWeight: 800 }}>{card.value}</span>
          </p>
        </article>
      ))}
    </div>
  );
}

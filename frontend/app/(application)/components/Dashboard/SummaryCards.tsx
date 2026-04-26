import { SummaryCard } from "./types";

interface SummaryCardsProps {
  summaryCards: SummaryCard[];
}

export default function SummaryCards({ summaryCards }: SummaryCardsProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {summaryCards.map((card) => (
        <article
          key={card.title}
          className="overflow-hidden rounded-xl border border-[#e2e2e6] bg-white"
        >
          <p className="px-4 py-2.5 text-[15px] text-[#404040] border-b border-[#e8e8ec]">
            {card.title}
          </p>
          <p className="px-4 pb-8 pt-5 leading-none sm:pb-10">
            <span className="text-[34px] font-bold text-[#c8c8d0] sm:text-[40px]">Level </span>
            <span className="text-[50px] font-extrabold text-[#0f0f0f] sm:text-[60px]">{card.value}</span>
          </p>
        </article>
      ))}
    </div>
  );
}

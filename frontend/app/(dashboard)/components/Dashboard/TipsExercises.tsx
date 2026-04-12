import { Tip } from "./types";

interface TipsExercisesProps {
  tips: Tip[];
}

export default function TipsExercises({ tips }: TipsExercisesProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <section className="col-span-2 rounded-2xl border border-[#e0e0e6] bg-white p-4">
        <h2 className="text-[18px] font-semibold text-[#1f1f1f] mb-3">Tip &amp; Exercises to follow</h2>
        <ul className="space-y-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#9b9ba3] flex-shrink-0" />
              <span>
                <span className="font-semibold text-[#2a2a2f]">{tip.bold}</span>
                {" — "}
                <span className="text-[#8a8a92]">{tip.light}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

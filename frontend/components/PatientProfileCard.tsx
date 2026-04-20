interface StatEntry {
  dateRange: string;
  anxiety: number;
  depression: number;
  stress: number;
}

interface Props {
  name: string;
  age: number;
  description: string;
  imageSrc: string;
  stats: StatEntry[];
}

const levelLabel = (n: number) => String(n).padStart(2, "0");

export function PatientProfileCard({
  name,
  age,
  description,
  imageSrc,
  stats,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-6 flex justify-between">
      {/* LEFT — Photo + Info */}
      <div className="flex gap-5 w-full">
        <img
          src={imageSrc}
          alt={name}
          className="rounded-xl object-cover aspect-square h-full shrink-0 bg-gray-200"
        />
        <div className="flex flex-col justify-center gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{age} years old</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">
              Description
            </p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-100" />

      {/* RIGHT — Statistics */}
      <div className="w-full overflow-y-auto max-h-52">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Statistics
        </h3>
        <div className="space-y-5">
          {stats.map((entry, i) => (
            <div key={i}>
              <p className="text-xs text-gray-400 mb-2">{entry.dateRange}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Anxiety",
                    value: entry.anxiety,
                    color: "bg-rose-300",
                  },
                  {
                    label: "Depression",
                    value: entry.depression,
                    color: "bg-green-300",
                  },
                  {
                    label: "Stress",
                    value: entry.stress,
                    color: "bg-amber-200",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-3 h-3 rounded-sm ${color} inline-block`}
                      />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <p className="text-gray-300 font-semibold text-sm">
                      Level{" "}
                      <span className="text-gray-800 text-lg font-bold">
                        {levelLabel(value)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

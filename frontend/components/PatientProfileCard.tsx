import { User } from "lucide-react";

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
  maritalStatus?: string;
  occupation?: string;
  gender?: string;
  sexualOrientation?: string;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "P";
}

const METRIC_COLORS = {
  Anxiety: { bar: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  Depression: { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Stress: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function PatientProfileCard({
  name,
  age,
  description,
  imageSrc,
  maritalStatus,
  occupation,
  gender,
  sexualOrientation,
}: Props) {
  const imageBase64 = imageSrc ? `data:image/jpeg;base64,${imageSrc}` : null;

  const infoItems = [
    { label: "Age", value: age ? `${age} years old` : null },
    { label: "Marital Status", value: maritalStatus },
    { label: "Occupation", value: occupation },
    { label: "Gender", value: gender },
    { label: "Sexual Orientation", value: sexualOrientation },
  ].filter((item) => item.value != null);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#980194]/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="shrink-0">
          {imageBase64 ? (
            <img
              src={imageBase64}
              alt={name}
              className="h-28 w-28 rounded-2xl object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="h-28 w-28 rounded-2xl border border-[#980194]/20 bg-[#f5e8f5] flex items-center justify-center shadow-sm">
              <span className="text-2xl font-semibold text-[#980194]">{getInitials(name)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{name}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-prose">{description}</p>
            )}
          </div>

          {infoItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {infoItems.map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                  <p className="mt-1 font-medium text-gray-900 text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function PatientStatistics({ stats }: { stats: StatEntry[] }) {
  if (stats.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm p-10 flex flex-col items-center justify-center gap-2 text-center">
        <User className="w-10 h-10 text-gray-200" />
        <p className="text-gray-500 text-sm">No statistics available yet.</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">Mental Health Statistics</h3>

      <div className="space-y-6 max-h-115 overflow-y-auto pr-1">
        {stats.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">{entry.dateRange}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { label: "Anxiety" as const, value: entry.anxiety },
                  { label: "Depression" as const, value: entry.depression },
                  { label: "Stress" as const, value: entry.stress },
                ] as { label: keyof typeof METRIC_COLORS; value: number }[]
              ).map(({ label, value }) => {
                const colors = METRIC_COLORS[label];
                const pct = Math.min(100, Math.max(0, (value / 10) * 100));
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                        {String(value).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors.bar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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
        <ul className="space-y-3">
          {stats.map((response, idx) => (
            <li
              key={response.dateRange}
              className="p-5 border border-gray-100 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#980194]">
                    Session {stats.length - idx}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {new Date(response.dateRange).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(response.dateRange).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Depression</p>
                  <p className="text-2xl font-semibold text-red-600 leading-none">
                    Level {response.depression}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Anxiety</p>
                  <p className="text-2xl font-semibold text-yellow-600 leading-none">
                    Level {response.anxiety}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Stress</p>
                  <p className="text-2xl font-semibold text-[#980194] leading-none">
                    Level {response.stress}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section >
  );
}

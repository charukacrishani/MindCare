import { Appointment } from "./types";

interface AppointmentsPanelProps {
  appointments: Appointment[];
}

function DoctorAvatar() {
  return (
    <div
      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: "#1a1a1a" }}
    >
      <svg viewBox="0 0 60 60" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" fill="#1a1a1a" />
        <ellipse cx="30" cy="68" rx="24" ry="20" fill="#2a2a2a" />
        <ellipse cx="30" cy="27" rx="12" ry="13" fill="#c49a6c" />
        <ellipse cx="30" cy="16" rx="12" ry="7" fill="#111" />
        <rect x="18" y="16" width="24" height="5" fill="#111" />
        <ellipse cx="25" cy="26" rx="2" ry="2.2" fill="#111" />
        <ellipse cx="35" cy="26" rx="2" ry="2.2" fill="#111" />
        <ellipse cx="25.6" cy="25.4" rx="0.7" ry="0.9" fill="white" opacity="0.5" />
        <ellipse cx="35.6" cy="25.4" rx="0.7" ry="0.9" fill="white" opacity="0.5" />
        <ellipse cx="30" cy="31" rx="1.2" ry="0.8" fill="#a87a4a" />
        <path d="M26.5 35 Q30 37.5 33.5 35" stroke="#9a6a3a" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <ellipse cx="18" cy="27" rx="2.2" ry="3" fill="#b8865a" />
        <ellipse cx="42" cy="27" rx="2.2" ry="3" fill="#b8865a" />
        <ellipse cx="30" cy="46" rx="22" ry="18" fill="#3a5a8a" />
        <rect x="27" y="40" width="6" height="18" fill="#e8e8ec" />
      </svg>
    </div>
  );
}

function statusStyle(status: Appointment["status"]) {
  if (status === "Pending") return { background: "#fef08a", color: "#854d0e" };
  if (status === "Completed") return { background: "#bbf7d0", color: "#15803d" };
  return { background: "#fecaca", color: "#b91c1c" };
}

export default function AppointmentsPanel({ appointments }: AppointmentsPanelProps) {
  return (
    <section className="col-span-1 w-full rounded-2xl border border-[#e0e0e6] bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#ebebef] flex-shrink-0 bg-white">
        <h2 className="text-[18px] text-[#1f1f1f] font-semibold leading-snug">
          Appointments with Counselors
        </h2>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {appointments.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[#e8e8ec] bg-white p-3">
            <div className="flex gap-3 items-start">
              <DoctorAvatar />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[13px] text-[#55555e] leading-snug">
                    Appointment with{" "}
                    <span className="font-semibold text-[#2a2a2f]">{item.doctor}</span>
                  </p>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0"
                    style={statusStyle(item.status)}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-[12px]">
                  <span className="text-[#9b9ba3]">Date</span>
                  <span className="text-[#9b9ba3]">Time</span>
                  <span className="text-[#3a3a3f] font-medium">{item.date}</span>
                  <span className="text-[#3a3a3f] font-medium">{item.time}</span>
                </div>
              </div>
            </div>
            {item.status === "Completed" && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#e4e4e8] bg-white px-3 py-2">
                <span className="text-[12px] text-[#6b6b73]">Rate Your Appointment</span>
                <span className="text-[18px]">⭐</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

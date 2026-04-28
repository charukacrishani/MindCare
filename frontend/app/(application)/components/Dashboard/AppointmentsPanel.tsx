import { useRouter } from "next/navigation";
import { Appointment } from "./types";

interface AppointmentsPanelProps {
  appointments: Appointment[];
}

function DoctorAvatar({ avatar }: { avatar?: string }) {
  if (!avatar) {
    return (
      <div
        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-300 flex items-center justify-center text-white text-[14px]"
      >
        No Image
      </div>
    );
  }

  const avatarBase64 = `data:image/jpeg;base64,${avatar}`;
  return (
    <div
      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: "#1a1a1a" }}
    >
      <img src={avatarBase64} alt="Doctor Avatar" className="w-full h-full object-cover" />
    </div>
  );
}

function statusStyle(status: Appointment["status"]) {
  if (status === "scheduled") return { background: "#fef08a", color: "#854d0e" };
  if (status === "completed") return { background: "#bbf7d0", color: "#15803d" };
  return { background: "#fecaca", color: "#b91c1c" };
}

export default function AppointmentsPanel({ appointments }: AppointmentsPanelProps) {
  const router = useRouter();
  
  return (
    <section className="col-span-1 w-full rounded-2xl border border-[#e0e0e6] bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#ebebef] flex-shrink-0 bg-white">
        <h2 className="text-[18px] text-[#1f1f1f] font-semibold leading-snug">
          Appointments with Counselors
        </h2>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {appointments.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[#e8e8ec] bg-white p-3 hover:bg-gray-100 cursor-pointer" onClick={()=> router.push(`/appointments/${item.id}`)}>
            <div className="flex gap-3 items-start">
              <DoctorAvatar avatar={item.avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[#2a2a2f]">{item.doctor_name}</span>
                </div>
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0"
                    style={statusStyle(item.status)}
                  >
                    {item.status.toLocaleUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-[12px]">
                  <span className="text-[#9b9ba3]">Date</span>
                  <span className="text-[#9b9ba3]">Time</span>
                  <span className="text-[#3a3a3f] font-medium">{new Date(item.start_time).toLocaleDateString()}</span>
                  <span className="text-[#3a3a3f] font-medium">{new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            {/* {item.status === "completed" && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#e4e4e8] bg-white px-3 py-2">
                <span className="text-[12px] text-[#6b6b73]">Rate Your Appointment</span>
                <span className="text-[18px]">⭐</span>
              </div>
            )} */}
          </article>
        ))}
      </div>
    </section>
  );
}

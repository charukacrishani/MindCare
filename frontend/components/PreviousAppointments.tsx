import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: string;
  date: string;
  time: string;
}

interface Props {
  appointments: Appointment[];
}

export function PreviousAppointments({ appointments }: Props) {
  const router = useRouter();

  return (
    <section className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm p-6 h-130 flex flex-col">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Previous Appointments</h3>
        <Calendar className="h-5 w-5 text-[#980194]" />
      </div>

      {appointments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Calendar className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-500">No appointments recorded for this patient.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-[#980194]/30 hover:bg-[#f5e8f5]/40 transition-colors"
            >
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Date</p>
                  <p className="font-medium text-gray-900">{appt.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">Time</p>
                  <p className="font-medium text-gray-900">{appt.time}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs px-4 h-8 border-gray-200 text-gray-600 hover:border-[#980194] hover:text-[#980194] hover:bg-white transition-colors"
                onClick={() => router.push(`/patient/appointment/${appt.id}`)}
              >
                Details <ClipboardList size={12} className="ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

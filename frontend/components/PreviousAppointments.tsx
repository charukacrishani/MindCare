import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-[520px] overflow-y-auto">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Previous Appointments
      </h3>
      <div className="space-y-3">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-400">Date:</span>
              <span className="font-semibold text-gray-800">{appt.date}</span>
              <span className="text-gray-400">Time:</span>
              <span className="font-semibold text-gray-800">{appt.time}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs px-4 h-8 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => router.push(`/patient/appointment/${appt.id}`)}
            >
              Details <ClipboardList size={12} className="ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

type AppointmentStatus = "pending" | "scheduled" | "completed" | "cancelled" | "no_show";
// type AppointmentAction = "startappointment" | "endappointment" | "viewpatient";

interface Appointment {
  id: string;
  name: string;
  status: AppointmentStatus;
  start_time: string;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "text-yellow-600 bg-yellow-50 border-yellow-100",
  },
  scheduled: {
    label: "Scheduled",
    className: "text-yellow-600 bg-yellow-50 border-yellow-100",
  },
  completed: {
    label: "Completed",
    className: "text-green-600 bg-green-50 border-green-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-red-500 bg-red-50 border-red-100",
  },
  no_show: {
    label: "No Show",
    className: "text-gray-600 bg-gray-50 border-gray-100",
  },
};

// const actionConfig: Record<
//   AppointmentAction,
//   { label: string; className: string }
// > = {
//   startappointment: {
//     label: "Start",
//     className: "bg-green-600 text-white hover:bg-green-700",
//   },
//   endappointment: {
//     label: "End",
//     className: "bg-red-600 text-white hover:bg-red-700",
//   },
//   viewpatient: {
//     label: "View Patient",
//     className: "bg-blue-600 text-white hover:bg-blue-700",
//   },
// };

export function AppointmentsTable() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]); // Default to today's date

  useEffect(() => {
    loadData();
  }, [selectedDate])

  const loadData = async () => {
    try {
      const response = await apiClient.get<Appointment[]>("/dashboard/doctor/appointments?date=" + selectedDate);
      setAppointments(response.data);
    } catch (error) {
      setAppointments([]);
      console.error("Error fetching appointments:", error);
    }
  }

  const filtered = appointments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleViewPatient = (id: string) => {

  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Appointments with Patients
        </h1>
        <div className="flex flex-row gap-2">
          <div className="relative w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 text-sm rounded-xl shadow-none"
            />
          </div>
          <div className="relative w-72 ">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-2 w-full bg-white border-gray-200 text-sm rounded-xl shadow-none p-2"
            />
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent">
              {["Name", "Status", "Date", "Time", "Actions"].map((col) => (
                <TableHead
                  key={col}
                  className="text-xs font-medium text-gray-400 uppercase tracking-wide py-4"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((appt) => {
              const status = statusConfig[appt.status];
              const id = appt.id;
              return (
                <TableRow
                  key={appt.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  onClick={() => router.push(`/patient/appointment/${id}`)}
                >
                  <TableCell className="py-4 font-medium text-gray-800 text-sm">
                    {appt.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium rounded-full px-3 py-0.5",
                        status.className,
                      )}
                    >
                      {status.label} <Check size={11} className="ml-1 inline" />
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {appt.start_time.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {appt.start_time.split("T")[1].slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Button size="sm">
                      View Patient
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

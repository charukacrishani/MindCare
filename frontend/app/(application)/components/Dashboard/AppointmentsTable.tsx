"use client";

import { useState } from "react";
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

type AppointmentStatus = "confirmed" | "pending" | "cancelled";
type AppointmentAction = "confirm" | "reschedule";

interface Appointment {
  id: string;
  name: string;
  status: AppointmentStatus;
  date: string;
  time: string;
  action: AppointmentAction;
}

const appointments: Appointment[] = [
  {
    id: "1",
    name: "Chandler Bing",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "confirm",
  },
  {
    id: "2",
    name: "Monica Geller",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "confirm",
  },
  {
    id: "3",
    name: "Ross Geller",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "confirm",
  },
  {
    id: "4",
    name: "Rachel Green",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "reschedule",
  },
  {
    id: "5",
    name: "Joey Tribbiani",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "reschedule",
  },
  {
    id: "6",
    name: "Phoebe Buffay",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "confirm",
  },
  {
    id: "7",
    name: "Emily Waltham",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "reschedule",
  },
  {
    id: "8",
    name: "Janice Hosenstein",
    status: "confirmed",
    date: "12-10-2026",
    time: "3:00 PM",
    action: "reschedule",
  },
];

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    className: "text-green-600 bg-green-50 border-green-100",
  },
  pending: {
    label: "Pending",
    className: "text-yellow-600 bg-yellow-50 border-yellow-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-red-500 bg-red-50 border-red-100",
  },
};

const actionConfig: Record<
  AppointmentAction,
  { label: string; className: string }
> = {
  confirm: {
    label: "Confirm",
    className: "bg-green-400 hover:bg-green-500 text-white border-0",
  },
  reschedule: {
    label: "Reschedule",
    className: "bg-yellow-200 hover:bg-yellow-300 text-yellow-800 border-0",
  },
};

export function AppointmentsTable() {
  const [search, setSearch] = useState("");

  const filtered = appointments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Appointments with Patients
        </h1>
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
              const action = actionConfig[appt.action];
              return (
                <TableRow
                  key={appt.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
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
                    {appt.date}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {appt.time}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className={cn(
                        "rounded-full text-xs px-4 h-8 font-medium",
                        action.className,
                      )}
                    >
                      {action.label} <Check size={12} className="ml-1" />
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

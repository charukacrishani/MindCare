"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { Loader, Calendar } from "lucide-react";

interface AppointmentItem {
    id: number;
    doctor_name?: string;
    start_time: string;
    end_time: string;
    status: string;
    reason?: string | null;
    notes?: string | null;
    avatar?: string | null;
}

function formatStatus(status: string) {
    if (status === "scheduled") return "Scheduled";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return status;
}

function statusBadgeClass(status: string) {
    if (status === "scheduled") return "bg-yellow-100 text-yellow-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await apiClient.get<AppointmentItem[]>("/appointments/user");
                setAppointments(response.data ?? []);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Could not load appointments. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointments();
    }, []);

    return (
        <div className="w-full mx-auto">
            <PageHeader title="My Appointments" shortTitle="Appointments" description="View and manage your upcoming and past appointments with counselors." />

            <div className="p-4">

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                        <p className="text-sm text-gray-500">Loading appointments...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!isLoading && !error && appointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                        <Calendar className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-500">No appointments found.</p>
                        <p className="text-sm text-gray-400">Book a session with a counselor to get started.</p>
                    </div>
                )}

                {!isLoading && !error && appointments.length > 0 && (
                    <div className="space-y-4">
                        {appointments.map((appointment) => {
                            const start = new Date(appointment.start_time);
                            const end = new Date(appointment.end_time);
                            const avatarSrc = appointment.avatar
                                ? `data:image/jpeg;base64,${appointment.avatar}`
                                : null;

                            return (
                                <Link
                                    href={`/appointments/${appointment.id}`}
                                    key={appointment.id}
                                    className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt={`${appointment.doctor_name ?? "Doctor"} avatar`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                "No Image"
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                    {appointment.doctor_name || "Unknown Doctor"}
                                                </h2>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(appointment.status)}`}
                                                >
                                                    {formatStatus(appointment.status)}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                                <p>
                                                    <span className="text-gray-500">Date:</span>{" "}
                                                    {start.toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <span className="text-gray-500">Time:</span>{" "}
                                                    {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>

                                            {appointment.reason && (
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                    <span className="text-gray-500">Reason:</span> {appointment.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

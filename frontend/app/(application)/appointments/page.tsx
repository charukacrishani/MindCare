"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";

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
                    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
                        Loading appointments...
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!isLoading && !error && appointments.length === 0 && (
                    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
                        No appointments found.
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
                                    className="block rounded-1xl border border-[#e5e7eb] bg-white p-4 hover:border-[#d1d5db] hover:shadow-sm transition"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#f3f4f6] flex items-center justify-center text-xs text-[#6b7280]">
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
                                                <h2 className="text-base sm:text-lg font-semibold text-[#111827] truncate">
                                                    {appointment.doctor_name || "Unknown Doctor"}
                                                </h2>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(appointment.status)}`}
                                                >
                                                    {formatStatus(appointment.status)}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#374151]">
                                                <p>
                                                    <span className="text-[#6b7280]">Date:</span>{" "}
                                                    {start.toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <span className="text-[#6b7280]">Time:</span>{" "}
                                                    {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>

                                            {appointment.reason && (
                                                <p className="mt-2 text-sm text-[#4b5563] line-clamp-2">
                                                    <span className="text-[#6b7280]">Reason:</span> {appointment.reason}
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
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import PersonalDataPopup from "./PersonalDataPopup";

interface AppointmentDetails {
    id: number;
    doctor_id: string;
    patient_id: string;
    doctor_name: string;
    patient_name: string;
    doctor_avatar?: string | null;
    patient_avatar?: string | null;
    start_time: string;
    end_time: string;
    status: string;
    reason?: string | null;
    notes?: string | null;
    doctor_notes?: string | null;
    created_at?: string;
    meet_link?: string | null;
}

function formatStatus(status: string) {
    if (status === "scheduled") return "Scheduled";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    if (status === "no_show") return "No Show";
    return status;
}

function statusBadgeClass(status: string) {
    if (status === "scheduled") return "bg-yellow-100 text-yellow-800";
    if (status === "completed") return "bg-green-100 text-green-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    if (status === "no_show") return "bg-slate-200 text-slate-800";
    return "bg-gray-100 text-gray-800";
}

function AvatarBlock({ src, label }: { src?: string | null; label: string }) {
    if (!src) {
        return (
            <div className="h-16 w-16 rounded-xl bg-[#f3f4f6] flex items-center justify-center text-xs text-[#6b7280]">
                No Image
            </div>
        );
    }

    return (
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-[#111827]">
            <img
                src={`data:image/jpeg;base64,${src}`}
                alt={`${label} avatar`}
                className="h-full w-full object-cover"
            />
        </div>
    );
}

export default function AppointmentPage() {
    const params = useParams<{ id: string }>();
    const appointmentId = params?.id;

    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [showPersonalDataPopup, setShowPersonalDataPopup] = useState(false);

    useEffect(() => {
        const loadAppointment = async () => {
            if (!appointmentId) {
                setError("Invalid appointment ID.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await apiClient.get<AppointmentDetails>(`/appointments/${appointmentId}`);
                setAppointment(response.data);
            } catch (err) {
                console.error("Error fetching appointment details:", err);
                setError("Could not load appointment details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    const handleCancelAppointment = async () => {
        if (!appointment) return;

        const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirmed) return;

        try {
            setIsCancelling(true);
            setActionMessage(null);

            const response = await apiClient.patch<AppointmentDetails>(
                `/appointments/${appointment.id}/cancel`
            );

            setAppointment((previous) => {
                if (!previous) return previous;
                return {
                    ...previous,
                    status: response.data?.status ?? "cancelled",
                };
            });

            setActionMessage("Appointment cancelled successfully.");
        } catch (err) {
            console.error("Error cancelling appointment:", err);
            setActionMessage("Could not cancel appointment. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const timeWindow = useMemo(() => {
        if (!appointment) return "-";
        const start = new Date(appointment.start_time);
        const end = new Date(appointment.end_time);
        return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })} - ${end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    }, [appointment]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-4">
                <Link
                    href="/appointments"
                    className="text-sm text-[#374151] hover:text-[#111827] underline underline-offset-2"
                >
                    Back to appointments
                </Link>
            </div>

            {isLoading && (
                <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
                    Loading appointment details...
                </div>
            )}

            {!isLoading && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!isLoading && !error && appointment && (
                <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <h1 className="text-2xl font-semibold text-[#111827]">Appointment #{appointment.id}</h1>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(appointment.status)}`}
                        >
                            {formatStatus(appointment.status)}
                        </span>
                    </div>

                    {actionMessage && (
                        <div
                            className={`mb-5 rounded-lg border p-3 text-sm ${appointment.status === "cancelled"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {actionMessage}
                        </div>
                    )}

                    {appointment.status === "scheduled" && (
                        <div className="mb-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCancelAppointment}
                                disabled={isCancelling}
                                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                            </button>
                            <button
                                type="button"
                                onClick={()=> setShowPersonalDataPopup(true)}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                Personal Data Consent
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-2">Counselor</p>
                            <div className="flex items-center gap-3">
                                <AvatarBlock src={appointment.doctor_avatar} label={appointment.doctor_name} />
                                <div>
                                    <p className="font-semibold text-[#111827]">{appointment.doctor_name}</p>
                                    <p className="text-xs text-[#6b7280]">ID: {appointment.doctor_id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-2">Patient</p>
                            <div className="flex items-center gap-3">
                                <AvatarBlock src={appointment.patient_avatar} label={appointment.patient_name} />
                                <div>
                                    <p className="font-semibold text-[#111827]">{appointment.patient_name}</p>
                                    <p className="text-xs text-[#6b7280]">ID: {appointment.patient_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-1">Schedule</p>
                            <p className="text-[#111827] font-medium">{timeWindow}</p>
                            <p className="text-xs text-[#6b7280] mt-2">
                                {appointment.meet_link && (
                                    <a
                                        href={appointment.meet_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Join Meeting
                                    </a>
                                )}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-1">Created</p>
                            <p className="text-[#111827] font-medium">
                                {appointment.created_at
                                    ? new Date(appointment.created_at).toLocaleString()
                                    : "Not available"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-1">Reason</p>
                            <p className="text-[#111827] whitespace-pre-wrap">
                                {appointment.reason?.trim() || "No reason provided."}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-1">Patient Notes</p>
                            <p className="text-[#111827] whitespace-pre-wrap">
                                {appointment.notes?.trim() || "No patient notes."}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[#edf0f3] p-4">
                            <p className="text-xs text-[#6b7280] mb-1">Counselor Notes</p>
                            <p className="text-[#111827] whitespace-pre-wrap">
                                {appointment.doctor_notes?.trim() || "No counselor notes."}
                            </p>
                        </div>
                    </div>
                </section>
            )}
            {showPersonalDataPopup && <PersonalDataPopup isOpen={showPersonalDataPopup} onClose={() => setShowPersonalDataPopup(false)} appointmentId={appointmentId!} />}
        </div>
    );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show" | string;
    reason?: string | null;
    notes?: string | null;
    patient_notes?: string | null;
    doctor_notes?: string | null;
    created_at?: string;
    meet_link?: string | null;
}

type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

function formatStatus(status: string) {
    if (status === "scheduled") return "Scheduled";
    if (status === "in_progress") return "In Session";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    if (status === "no_show") return "No Show";
    return status;
}

function statusBadgeClass(status: string) {
    if (status === "scheduled") return "bg-yellow-100 text-yellow-800";
    if (status === "in_progress") return "bg-amber-100 text-amber-700";
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    if (status === "no_show") return "bg-gray-200 text-gray-700";
    return "bg-gray-100 text-gray-700";
}

function AvatarBlock({ src, label }: { src?: string | null; label: string }) {
    if (!src) {
        return (
            <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                No Image
            </div>
        );
    }

    return (
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-900">
            <img
                src={`data:image/jpeg;base64,${src}`}
                alt={`${label} avatar`}
                className="h-full w-full object-cover"
            />
        </div>
    );
}

export default function AppointmentDetail() {
    const params = useParams<{ id: string }>();
    const appointmentId = params?.id;

    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [counselorNotes, setCounselorNotes] = useState("");
    const [patientNotes, setPatientNotes] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

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
                setActionMessage(null);

                const response = await apiClient.get<AppointmentDetails>(`/appointments/${appointmentId}`);
                const data = response.data;

                setAppointment(data);
                setCounselorNotes(data.doctor_notes || "");
                setPatientNotes(data.patient_notes || "");
            } catch (err) {
                console.error("Error fetching appointment details:", err);
                setError("Could not load appointment details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    const updateAppointment = async (
        payload: { status?: SessionStatus; doctor_notes?: string; patient_notes?: string },
        successMessage: string
    ) => {
        if (!appointment) return;

        try {
            setIsSaving(true);
            setActionMessage(null);

            const response = await apiClient.patch<AppointmentDetails>(
                `/appointments/${appointment.id}/counselor`,
                payload
            );

            const updated = response.data;
            setAppointment((previous) => {
                if (!previous) return previous;
                return {
                    ...previous,
                    status: updated?.status ?? previous.status,
                    doctor_notes: updated?.doctor_notes ?? counselorNotes,
                    patient_notes: updated?.patient_notes ?? patientNotes,
                };
            });

            setActionMessage(successMessage);
        } catch (err) {
            console.error("Error updating appointment:", err);
            setActionMessage("Could not save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        await updateAppointment(
            { doctor_notes: counselorNotes, patient_notes: patientNotes },
            "Notes saved successfully."
        );
    };

    const handleStartSession = async () => {
        await updateAppointment(
            { status: "in_progress", doctor_notes: counselorNotes },
            "Session started."
        );
    };

    const handleEndSession = async () => {
        await updateAppointment(
            { status: "completed", doctor_notes: counselorNotes },
            "Session ended and marked as completed."
        );
    };

    const handleNoShow = async () => {
        const confirmed = window.confirm("Mark this appointment as No Show?");
        if (!confirmed) return;

        await updateAppointment(
            { status: "no_show", doctor_notes: counselorNotes },
            "Appointment marked as no show."
        );
    };

    const canStartSession = appointment?.status === "scheduled";
    const canEndSession = appointment?.status === "in_progress";
    const canMarkNoShow = appointment?.status === "scheduled" || appointment?.status === "in_progress";

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
        <div className="w-full mx-auto">
            <PageHeader title="Appointment Details" shortTitle={`Appointment #${appointmentId}`} description="Review the details of this appointment, update session notes, and manage the session status." />

            <div className="p-4">

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                        <p className="text-sm text-gray-500">Loading appointment details...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!isLoading && !error && appointment && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                <h1 className="text-2xl font-semibold text-gray-900">Appointment #{appointment.id}</h1>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(appointment.status)}`}
                                >
                                    {formatStatus(appointment.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-2">Counselor</p>
                                    <div className="flex items-center gap-3">
                                        <AvatarBlock src={appointment.doctor_avatar} label={appointment.doctor_name} />
                                        <div>
                                            <p className="font-semibold text-gray-900">{appointment.doctor_name}</p>
                                            <p className="text-xs text-gray-500">ID: {appointment.doctor_id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-2">Patient</p>
                                    <div className="flex items-center gap-3">
                                        <AvatarBlock src={appointment.patient_avatar} label={appointment.patient_name} />
                                        <div>
                                            <p className="font-semibold text-gray-900">{appointment.patient_name}</p>
                                            <p className="text-xs text-gray-500">ID: {appointment.patient_id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-1">Schedule</p>
                                    <p className="text-gray-900 font-medium">{timeWindow}</p>
                                    {appointment.meet_link && (
                                        <a
                                            href={appointment.meet_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-[#980194] hover:underline"
                                        >
                                            Join Meeting
                                        </a>
                                    )}
                                </div>

                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-1">Created</p>
                                    <p className="text-gray-900 font-medium">
                                        {appointment.created_at
                                            ? new Date(appointment.created_at).toLocaleString()
                                            : "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {appointment.reason?.trim() || "No reason provided."}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-1">Patient Notes</p>
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {appointment.notes?.trim() || "No patient notes."}
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                className="mt-4 w-full bg-gray-900 hover:bg-black text-white"
                                onClick={() => window.open(`/patient/${appointment.patient_id}`, "_blank")}
                            >
                                View Patient
                            </Button>
                        </section>

                        <aside className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 h-fit">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Engine</h2>

                            {actionMessage && (
                                <div
                                    className={`mb-4 rounded-lg border p-3 text-sm ${actionMessage.includes("success")
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                        }`}
                                >
                                    {actionMessage}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="rounded-xl border border-gray-100 p-3">
                                    <p className="text-xs text-gray-500 mb-2">Current State</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatStatus(appointment.status)}</p>
                                </div>

                                <div>
                                    <label htmlFor="counselor-notes" className="mb-1 block text-sm font-medium text-gray-700">
                                        Counselor Notes
                                    </label>
                                    <textarea
                                        id="counselor-notes"
                                        value={counselorNotes}
                                        onChange={(event) => setCounselorNotes(event.target.value)}
                                        placeholder="Add private session notes"
                                        rows={7}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="counselor-patient-notes" className="mb-1 block text-sm font-medium text-gray-700">
                                        Patient Notes
                                    </label>
                                    <textarea
                                        id="counselor-patient-notes"
                                        value={patientNotes}
                                        onChange={(event) => setPatientNotes(event.target.value)}
                                        placeholder="Add private patient notes"
                                        rows={7}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="w-full bg-gray-900 hover:bg-black text-white disabled:opacity-60"
                                >
                                    {isSaving ? "Saving..." : "Save Notes"}
                                </Button>

                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleStartSession}
                                        disabled={isSaving || !canStartSession}
                                        className="w-full bg-[#980194] hover:bg-[#7a0177] text-white disabled:opacity-50"
                                    >
                                        {appointment.status === "in_progress" ? "Session Active" : "Start Session"}
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handleEndSession}
                                        disabled={isSaving || !canEndSession}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                    >
                                        End Session
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handleNoShow}
                                        disabled={isSaving || !canMarkNoShow}
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        No Show
                                    </Button>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

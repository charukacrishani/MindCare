"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import PersonalDataPopup from "./PersonalDataPopup";
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
    status: string;
    reason?: string | null;
    notes?: string | null;
    doctor_notes?: string | null;
    created_at?: string;
    meet_link?: string | null;
}

interface DoctorReview {
    id: number;
    doctor_id: string;
    patient_id: string;
    appointment_id: number;
    rating: number;
    comment?: string | null;
    created_at?: string;
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
    if (status === "no_show") return "bg-gray-200 text-gray-800";
    return "bg-gray-100 text-gray-800";
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

export default function AppointmentPage() {
    const params = useParams<{ id: string }>();
    const appointmentId = params?.id;

    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [showPersonalDataPopup, setShowPersonalDataPopup] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<string | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [existingReview, setExistingReview] = useState<DoctorReview | null>(null);

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
                setExistingReview(null);
                setReviewMessage(null);
                setReviewError(null);
                const response = await apiClient.get<AppointmentDetails>(`/appointments/${appointmentId}`);
                setAppointment(response.data);

                if (response.data?.status === "completed") {
                    try {
                        const reviewResponse = await apiClient.get<DoctorReview>(`/appointments/${appointmentId}/rate`);
                        setExistingReview(reviewResponse.data);
                        setSelectedRating(reviewResponse.data.rating);
                        setReviewComment(reviewResponse.data.comment ?? "");
                    } catch (reviewErr) {
                        const message = reviewErr instanceof Error ? reviewErr.message : "";
                        if (!message.toLowerCase().includes("no review found")) {
                            console.error("Error loading appointment review:", reviewErr);
                            setReviewError("Could not load appointment review.");
                        }
                    }
                } else {
                    setSelectedRating(0);
                    setReviewComment("");
                }
            } catch (err) {
                console.error("Error fetching appointment details:", err);
                setError("Could not load appointment details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    const handleSubmitReview = async () => {
        if (!appointment || appointment.status !== "completed") return;

        if (selectedRating < 1 || selectedRating > 5) {
            setReviewError("Please select a rating between 1 and 5.");
            return;
        }

        try {
            setIsSubmittingReview(true);
            setReviewError(null);
            setReviewMessage(null);

            const response = await apiClient.post<DoctorReview>(
                `/appointments/${appointment.id}/rate`,
                {
                    rating: selectedRating,
                    comment: reviewComment,
                }
            );

            setExistingReview(response.data);
            setReviewMessage("Thank you. Your review was submitted.");
        } catch (err) {
            console.error("Error submitting doctor review:", err);
            setReviewError(err instanceof Error ? err.message : "Could not submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

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
        <div className="w-full mx-auto">
            <PageHeader title="Appointment Details" shortTitle="Appointment" description="View the details of your appointment, including counselor information, schedule, and notes." />

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
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <h1 className="text-2xl font-semibold text-gray-900">Appointment #{appointment.id}</h1>
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
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleCancelAppointment}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-[#980194] hover:bg-[#7a0177] text-white"
                                    onClick={() => setShowPersonalDataPopup(true)}
                                >
                                    Personal Data Consent
                                </Button>
                            </div>
                        )}

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
                                <p className="text-xs text-gray-500 mt-2">
                                    {appointment.meet_link && (
                                        <a
                                            href={appointment.meet_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#980194] hover:underline"
                                        >
                                            Join Meeting
                                        </a>
                                    )}
                                </p>
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

                            <div className="rounded-xl border border-gray-100 p-4">
                                <p className="text-xs text-gray-500 mb-1">Counselor Notes</p>
                                <p className="text-gray-900 whitespace-pre-wrap">
                                    {appointment.doctor_notes?.trim() || "No counselor notes."}
                                </p>
                            </div>

                            {appointment.status === "completed" && (
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-500 mb-3">Doctor Review</p>

                                    {existingReview ? (
                                        <div className="space-y-2">
                                            <p className="text-gray-900 font-medium">
                                                Rating: {existingReview.rating}/5
                                            </p>
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {existingReview.comment?.trim() || "No comment provided."}
                                            </p>
                                            {existingReview.created_at && (
                                                <p className="text-xs text-gray-500">
                                                    Submitted on {new Date(existingReview.created_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setSelectedRating(value)}
                                                        className={`rounded-lg border px-3 py-1 text-sm font-medium transition-colors ${selectedRating === value
                                                            ? "border-[#980194] bg-[#980194] text-white"
                                                            : "border-gray-300 bg-white text-gray-900 hover:border-[#980194] hover:text-[#980194]"
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>

                                            <textarea
                                                value={reviewComment}
                                                onChange={(event) => setReviewComment(event.target.value)}
                                                rows={3}
                                                placeholder="Write an optional comment about your experience"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                                            />

                                            {reviewError && (
                                                <p className="text-sm text-red-600">{reviewError}</p>
                                            )}
                                            {reviewMessage && (
                                                <p className="text-sm text-green-700">{reviewMessage}</p>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={handleSubmitReview}
                                                disabled={isSubmittingReview}
                                                className="bg-[#980194] hover:bg-[#7a0177] text-white disabled:opacity-50"
                                            >
                                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {showPersonalDataPopup && <PersonalDataPopup isOpen={showPersonalDataPopup} onClose={() => setShowPersonalDataPopup(false)} appointmentId={appointmentId!} />}
            </div>
        </div>
    );
}

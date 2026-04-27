'use client'

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock3, Loader, Sparkles, Star } from "lucide-react"
import { apiClient } from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/PageHeader"
import { SPECIALIZATIONS } from "@/app/(application)/components/ProfileSetupForm"
import { SpecializationGrid } from "@/app/(application)/components/SpecializationGrid"

type DoctorProfile = {
    userid: string
    display_name: string
    full_name?: string | null
    avatar?: string | null
    specializations?: string | null
    years_of_experience?: number | null
    location?: string | null
    hospital?: string | null
    license_no?: string | null
    licence_number?: string | null
    available?: boolean
    average_rating?: number | null
    review_count?: number
}

type DoctorReview = {
    id: number
    doctor_id: string
    patient_id: string
    appointment_id: number
    rating: number
    comment?: string | null
    created_at?: string
    patient_name?: string
    patient_avatar?: string | null
}

type Availability = {
    id: number
    doctor_id: string
    day_of_week: number
    start_time: string
    end_time: string
    slot_duration_minutes: number
    is_active: boolean
}

type DoctorProfileResponse = {
    doctor: DoctorProfile
    reviews: DoctorReview[]
}

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function getInitials(name?: string | null) {
    const source = (name || "DR").trim()
    const initials = source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")

    return initials.toUpperCase() || "DR"
}

function formatTime(timeValue: string) {
    if (!timeValue) return "--"

    const parts = timeValue.split(":")
    const hours = Number(parts[0] || 0)
    const minutes = Number(parts[1] || 0)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatRating(rating?: number | null) {
    if (rating == null) return "No rating yet"
    return `${rating.toFixed(1)} / 5`
}

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((value) => (
                <Star
                    key={value}
                    className={`h-4 w-4 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                />
            ))}
        </div>
    )
}

export default function ViewCounselorPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const doctorId = params?.id

    const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
    const [reviews, setReviews] = useState<DoctorReview[]>([])
    const [availability, setAvailability] = useState<Availability[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [availabilityError, setAvailabilityError] = useState<string | null>(null)

    useEffect(() => {
        const loadDoctor = async () => {
            if (!doctorId) {
                setError("Invalid counselor ID.")
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                setAvailabilityError(null)

                const [profileResult, availabilityResult] = await Promise.allSettled([
                    apiClient.get<DoctorProfileResponse>(`/doctor/${doctorId}`),
                    apiClient.get<Availability[]>(`/appointments/doctor/${doctorId}/availability`),
                ])

                if (profileResult.status === "fulfilled") {
                    setDoctor(profileResult.value.data.doctor)
                    setReviews(profileResult.value.data.reviews || [])
                } else {
                    setError(profileResult.reason instanceof Error ? profileResult.reason.message : "Failed to load counselor profile.")
                }

                if (availabilityResult.status === "fulfilled") {
                    setAvailability(availabilityResult.value.data || [])
                } else {
                    setAvailability([])
                    setAvailabilityError("Availability could not be loaded right now.")
                }
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Failed to load counselor details.")
            } finally {
                setLoading(false)
            }
        }

        loadDoctor()
    }, [doctorId])

    const groupedAvailability = useMemo(() => {
        const groups = new Map<number, Availability[]>()

        availability
            .filter((slot) => slot.is_active)
            .sort((left, right) => left.day_of_week - right.day_of_week || left.start_time.localeCompare(right.start_time))
            .forEach((slot) => {
                const items = groups.get(slot.day_of_week) || []
                items.push(slot)
                groups.set(slot.day_of_week, items)
            })

        return Array.from(groups.entries())
    }, [availability])

    const averageRating = doctor?.average_rating ?? null
    const reviewCount = doctor?.review_count ?? reviews.length

    return (
        <div className="w-full">
            <PageHeader
                title="Counselor Profile"
                shortTitle="Counselors"
                description="Review counselor details, availability, and client feedback before booking an appointment."
            />

            <div className="relative overflow-hidden px-4 pb-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-56" />

                {loading && (
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/85 p-10 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Loader className="h-5 w-5 animate-spin text-[#980194]" />
                            Loading counselor profile...
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && doctor && (
                    <div className="relative space-y-6">
                        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#980194]/10 blur-3xl" />
                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <Avatar className="h-24 w-24 rounded-2xl border border-slate-200 shadow-sm">
                                        <AvatarImage
                                            src={doctor.avatar ? `data:image/jpeg;base64,${doctor.avatar}` : undefined}
                                            alt={doctor.display_name}
                                        />
                                        <AvatarFallback className="rounded-2xl bg-[#f5e8f5] text-lg font-semibold text-[#980194]">
                                            {getInitials(doctor.display_name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                                    {doctor.display_name}
                                                </h1>
                                                <Badge className={doctor.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                                                    {doctor.available ? "Available" : "Unavailable"}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Star className="h-4 w-4 text-amber-400" />
                                                    {formatRating(averageRating)}
                                                </span>
                                                <span>{reviewCount} reviews</span>
                                            </div>
                                        </div>

                                        <div className="max-w-2xl">
                                            <SpecializationGrid
                                                value={doctor.specializations || ""}
                                                options={SPECIALIZATIONS}
                                                onChange={() => { }}
                                                viewMode
                                            />
                                        </div>

                                        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">Experience</p>
                                                <p className="mt-1 font-medium text-slate-900">
                                                    {doctor.years_of_experience != null ? `${doctor.years_of_experience} years` : "Not specified"}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                                                <p className="mt-1 font-medium text-slate-900">
                                                    {doctor.location || "Not specified"}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">Hospital</p>
                                                <p className="mt-1 font-medium text-slate-900">
                                                    {doctor.hospital || "Not specified"}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">License</p>
                                                <p className="mt-1 font-medium text-slate-900">
                                                    {doctor.licence_number || doctor.license_no || "Not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                                    <Button
                                        variant="outline"
                                        className="border-slate-200 text-slate-700 hover:border-[#980194] hover:text-[#980194]"
                                        onClick={() => router.push("/counselors")}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to counselors
                                    </Button>
                                    <Button
                                        className="bg-[#980194] text-white hover:bg-[#7c0178]"
                                        onClick={() => router.push(`/counselors/${doctorId}/book`)}
                                    >
                                        Book appointment
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
                                            <p className="text-sm text-slate-500">Weekly schedule pulled from the booking backend.</p>
                                        </div>
                                        <CalendarDays className="h-5 w-5 text-[#980194]" />
                                    </div>

                                    {availabilityError && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                            {availabilityError}
                                        </div>
                                    )}

                                    {!availabilityError && groupedAvailability.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                            No availability has been published yet.
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {groupedAvailability.map(([dayOfWeek, slots]) => (
                                            <div key={dayOfWeek} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="font-medium text-slate-900">{DAY_LABELS[dayOfWeek] || `Day ${dayOfWeek + 1}`}</p>
                                                    <span className="text-xs uppercase tracking-wide text-slate-500">
                                                        {slots.length} slot{slots.length === 1 ? "" : "s"}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {slots.map((slot) => (
                                                        <span
                                                            key={slot.id}
                                                            className="inline-flex items-center gap-1 rounded-full border border-[#980194]/20 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                                        >
                                                            <Clock3 className="h-3.5 w-3.5 text-[#980194]" />
                                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Doctor Reviews</h2>
                                            <p className="text-sm text-slate-500">What patients have said after their appointments.</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex justify-end">
                                                <StarRow rating={Math.round(averageRating || 0)} />
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">{formatRating(averageRating)}</p>
                                        </div>
                                    </div>

                                    {reviews.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                            No reviews yet for this counselor.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reviews.map((review) => {
                                                const submittedAt = review.created_at ? new Date(review.created_at) : null

                                                return (
                                                    <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar className="h-11 w-11 border border-slate-200">
                                                                <AvatarImage
                                                                    src={review.patient_avatar ? `data:image/jpeg;base64,${review.patient_avatar}` : undefined}
                                                                    alt={review.patient_name || "Patient"}
                                                                />
                                                                <AvatarFallback className="bg-white text-xs font-semibold text-slate-600">
                                                                    {getInitials(review.patient_name)}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="min-w-0 flex-1 space-y-2">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div>
                                                                        <p className="font-medium text-slate-900">{review.patient_name || "Patient"}</p>
                                                                        <p className="text-xs text-slate-500">
                                                                            {submittedAt ? submittedAt.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) : "Recently"}
                                                                        </p>
                                                                    </div>
                                                                    <StarRow rating={review.rating} />
                                                                </div>

                                                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                                    {review.comment?.trim() || "No written comment was provided for this review."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
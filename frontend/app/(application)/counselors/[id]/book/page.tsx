'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, ServerResponse } from '@/lib/apiClient';
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import CardPaymentMockup from '@/app/(application)/components/PaymentForm';
import { SpecializationGrid } from '@/app/(application)/components/SpecializationGrid';
import { SPECIALIZATIONS } from '@/app/(application)/components/ProfileSetupForm';
import { PageHeader } from '@/components/PageHeader';

interface DoctorInfo {
    userid: string;
    full_name: string;
    avatar?: string;
    specializations?: string;
}

interface Availability {
    id: number;
    doctor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_active: boolean;
}

interface TimeSlot {
    start_time: string;
    end_time: string;
}

export default function BookAppointmentPage() {
    const params = useParams();
    const doctorId = params.id as string;

    // State
    const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [allowChatAccess, setAllowChatAccess] = useState(false);
    const [allowDetailAccess, setAllowDetailAccess] = useState(false);

    // UI State
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPayment, setShowPayment] = useState(false);


    // Fetch doctor info and availability
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch doctor info from doctors list
                const doctorResponse = await apiClient.get<ServerResponse>('/doctor/list');

                if (doctorResponse.success && Array.isArray(doctorResponse.data)) {
                    const foundDoctor = doctorResponse.data.find(
                        (d: any) => d.userid === doctorId
                    );
                    setDoctor(foundDoctor || null);
                }

                // Fetch doctor availability
                const availResponse = await apiClient.get<ServerResponse>(
                    `/appointments/doctor/${doctorId}/availability`
                );

                if (availResponse.success && Array.isArray(availResponse.data)) {
                    setAvailability(availResponse.data);

                    // Set default date to next available day
                    const nextAvailableDate = getNextAvailableDate(availResponse.data);
                    if (nextAvailableDate) {
                        setSelectedDate(nextAvailableDate);
                    }
                }
            } catch (err) {
                setError('Failed to load doctor information. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) {
            fetchDoctorData();
        }
    }, [doctorId]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate && doctorId) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            setError('');
            setSelectedSlot(null);

            const slotsResponse = await apiClient.get<ServerResponse>(
                `/appointments/doctor/${doctorId}/available-slots`,
                { date: selectedDate }
            );

            if (slotsResponse.success && Array.isArray(slotsResponse.data)) {
                setAvailableSlots(slotsResponse.data);

                if (slotsResponse.data.length === 0) {
                    setError('No available slots for this date. Please select another date.');
                }
            } else {
                setError(slotsResponse.message || 'Failed to load available slots');
            }
        } catch (err) {
            setError('Failed to load available slots. Please try again.');
            console.error(err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedSlot) {
            setError('Please select a time slot');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const appointmentData = {
                doctor_id: doctorId,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
                reason: reason || undefined,
                notes: notes || undefined,
                allowChatAccess: allowChatAccess,
                allowDetailAccess: allowDetailAccess,
            };

            const response = await apiClient.post<ServerResponse>(
                '/appointments/create',
                appointmentData
            );

            if (response.success) {
                setSuccess(true);
                setSuccessMessage(
                    'Appointment booked successfully! You can view it in your dashboard.'
                );
                // Reset form
                setSelectedSlot(null);
                setReason('');
                setNotes('');

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setError(response.message || 'Failed to book appointment');
            }
        } catch (err) {
            setError('An error occurred while booking. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getNextAvailableDate = (availabilityData: Availability[]): string => {
        const availableDays = availabilityData.map((a) => a.day_of_week);
        if (availableDays.length === 0) return '';

        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            // Convert JavaScript's getDay (0=Sun) to backend's day_of_week (0=Mon)
            const backendDayOfWeek = (date.getDay() + 6) % 7;
            if (availableDays.includes(backendDayOfWeek)) {
                return date.toISOString().split('T')[0];
            }
        }

        return '';
    };

    const getDaysAvailableInNextMonth = (): string[] => {
        const availableDays = availability.map((a) => a.day_of_week);
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            // Convert JavaScript's getDay (0=Sun) to backend's day_of_week (0=Mon)
            const backendDayOfWeek = (date.getDay() + 6) % 7;
            if (availableDays.includes(backendDayOfWeek)) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }

        return dates;
    };

    const formatTime = (dateTimeString: string): string => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const getDayName = (dateString: string): string => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4 py-20">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-[#980194] mx-auto mb-4" />
                    <p className="text-gray-600">Loading doctor information...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full">
                <div className="mx-auto">

                    {/* Page header */}
                    <PageHeader title="Book Appointment" shortTitle="Book Appointment" description="Select a date and time to book your session with the counselor." />
                    <div className='p-4 '>
                        {/* Alerts */}
                        {success && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-green-900">Booked!</p>
                                    <p className="text-green-800">{successMessage}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900">Error</p>
                                    <p className="text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Doctor card */}
                        {doctor && (
                            <Card className="p-5 border-gray-100 shadow-sm mb-4">
                                <div className="flex items-center gap-4">
                                    {doctor.avatar ? (
                                        <img
                                            src={`data:image/png;base64,${doctor.avatar}`}
                                            alt={doctor.full_name}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <span className="text-lg font-semibold text-[#980194]">
                                                {doctor.full_name?.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-semibold text-gray-900">{doctor.full_name}</h2>
                                        <div className="mt-1">
                                            <SpecializationGrid value={doctor.specializations} options={SPECIALIZATIONS} onChange={() => { }} viewMode />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {!success && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* Date selection */}
                                <Card className="p-5 border-gray-100 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#980194]" />
                                        Select Date
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {getDaysAvailableInNextMonth().map((date) => {
                                            const active = selectedDate === date;
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`p-2 rounded-lg text-xs font-medium transition-all text-center leading-snug
                                                    ${active
                                                            ? 'bg-[#980194] text-white shadow-sm'
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#980194] hover:text-[#980194]'
                                                        }`}
                                                >
                                                    <div className={active ? 'text-white/80' : 'text-gray-400'}>
                                                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                                                    </div>
                                                    <div className="font-semibold">{new Date(date + 'T00:00:00').getDate()}</div>
                                                    <div className={active ? 'text-white/80' : 'text-gray-400'}>{getDayName(date)}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedDate && (
                                        <p className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                            {formatDate(selectedDate)}
                                        </p>
                                    )}
                                </Card>

                                {/* Time slot selection */}
                                <Card className="p-5 border-gray-100 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#980194]" />
                                        Select Time
                                    </h3>
                                    {!selectedDate ? (
                                        <p className="text-sm text-gray-400 italic">Pick a date first.</p>
                                    ) : loadingSlots ? (
                                        <div className="flex justify-center py-8">
                                            <Loader className="w-6 h-6 animate-spin text-[#980194]" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                {availableSlots.map((slot, idx) => {
                                                    const active = selectedSlot?.start_time === slot.start_time;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`p-2 rounded-lg text-xs font-medium transition-all
                                                            ${active
                                                                    ? 'bg-[#980194] text-white shadow-sm'
                                                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#980194] hover:text-[#980194]'
                                                                }`}
                                                        >
                                                            {formatTime(slot.start_time)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedSlot && (
                                                <p className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                                    {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No slots available for this date.</p>
                                    )}
                                </Card>

                                {/* Details + confirm */}
                                <Card className="p-5 border-gray-100 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Additional Details</h3>

                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <Label htmlFor="reason" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Reason for Visit
                                            </Label>
                                            <Input
                                                id="reason"
                                                placeholder="e.g., Anxiety management"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="notes" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Notes
                                            </Label>
                                            <textarea
                                                id="notes"
                                                placeholder="Anything else you'd like to share..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2 pt-1">
                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={allowChatAccess}
                                                    onChange={(e) => setAllowChatAccess(e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 accent-[#980194]"
                                                />
                                                <span className="text-xs text-gray-600">Allow counselor to view chat history</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={allowDetailAccess}
                                                    onChange={(e) => setAllowDetailAccess(e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 accent-[#980194]"
                                                />
                                                <span className="text-xs text-gray-600">Allow counselor to view your profile</span>
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setShowPayment(true)}
                                        disabled={!selectedSlot || submitting}
                                        className="w-full bg-[#980194] hover:bg-[#7a0177] text-white font-semibold disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin mr-2" />
                                                Booking...
                                            </>
                                        ) : (
                                            'Confirm Booking'
                                        )}
                                    </Button>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showPayment && (
                <CardPaymentMockup
                    handleBookAppointment={() => {
                        setShowPayment(false);
                        handleBookAppointment();
                    }}
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    amount={"GBP 25"}
                />
            )}
        </>
    );
}

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

interface DoctorInfo {
    userid: string;
    first_name: string;
    last_name: string;
    avatar?: string;
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

    // UI State
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


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
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading doctor information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/counselors">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                </div>

                {/* Success Message */}
                {success && (
                    <Card className="mb-6 p-4 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900">Success!</h3>
                                <p className="text-green-800 text-sm">{successMessage}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Error Message */}
                {error && (
                    <Card className="mb-6 p-4 bg-red-50 border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error</h3>
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Doctor Card */}
                {doctor && (
                    <Card className="mb-4 p-6 bg-white shadow-sm border-0">
                        <div className="flex items-start gap-4">
                            {doctor.avatar ? (
                                <img
                                    src={`data:image/png;base64,${doctor.avatar}`}
                                    alt={doctor.first_name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xl font-semibold text-blue-600">
                                        {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </h2>
                                <p className="text-gray-600">Professional Counselor</p>
                            </div>
                        </div>
                    </Card>
                )}

                {!success && (
                    <div className="justify-between flex flex-row gap-3">
                        <div className="w-full md:w-1/2">
                            {/* Date Selection */}
                            <Card className="mb-8 p-6 bg-white shadow-sm border-0 w-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Select Date
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {getDaysAvailableInNextMonth().map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`p-3 rounded-lg font-medium transition-all ${selectedDate === date
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="text-xs text-center text-gray-500">
                                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                    month: 'short',
                                                })} - {new Date(date + 'T00:00:00').getDate()}
                                            </div>
                                            <div className="text-xs text-center">{getDayName(date)}</div>
                                        </button>
                                    ))}
                                </div>

                                {selectedDate && (
                                    <p className="mt-4 text-sm text-gray-600">
                                        Selected: {formatDate(selectedDate)}
                                    </p>
                                )}
                            </Card>
                        </div>
                        <div className="w-full md:w-1/2">
                            {/* Time Slot Selection */}
                            {selectedDate && (
                                <Card className="mb-8 p-6 bg-white shadow-sm border-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        Select Time
                                    </h3>

                                    {loadingSlots ? (
                                        <div className="flex justify-center py-8">
                                            <Loader className="w-8 h-8 animate-spin text-blue-500" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {availableSlots.map((slot, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`p-3 rounded-lg font-medium transition-all ${selectedSlot?.start_time === slot.start_time
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {formatTime(slot.start_time)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No available slots for this date</p>
                                    )}

                                    {selectedSlot && (
                                        <p className="mt-4 text-sm text-gray-600">
                                            Selected: {formatTime(selectedSlot.start_time)} -{' '}
                                            {formatTime(selectedSlot.end_time)}
                                        </p>
                                    )}
                                </Card>
                            )}
                        </div>

                        <div className="w-full md:w-1/2">
                            {/* Additional Details */}
                            <Card className="mb-8 p-6 bg-white shadow-sm border-0">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Additional Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="reason" className="text-gray-700 font-medium">
                                            Reason for Visit (Optional)
                                        </Label>
                                        <Input
                                            id="reason"
                                            placeholder="e.g., Anxiety management, Career counseling"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes" className="text-gray-700 font-medium">
                                            Additional Notes (Optional)
                                        </Label>
                                        <textarea
                                            id="notes"
                                            placeholder="Any additional information you'd like to share..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="chatAccess" className="text-gray-700 font-medium flex items-center gap-2">
                                            Allow counselor to access chat history (Optional)
                                        </Label>
                                        <input
                                            type="checkbox"
                                            id="chatAccess"
                                            checked={allowChatAccess}
                                            onChange={(e) => setAllowChatAccess(e.target.checked)}
                                            className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                    </div>
                                </div>
                                {/* Book Button */}
                                <Button
                                    onClick={handleBookAppointment}
                                    disabled={!selectedSlot || submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
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
                    </div>
                )}
            </div>
        </div>
    );
}

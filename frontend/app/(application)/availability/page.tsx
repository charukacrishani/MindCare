'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, ServerResponse } from '@/lib/apiClient';
import {
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    Loader,
    CalendarOff,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/PageHeader';

interface Availability {
    id: number;
    doctor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_active: boolean;
}

interface TimeOff {
    id: number;
    doctor_id: string;
    start_datetime: string;
    end_datetime: string;
    reason?: string;
}

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export default function AvailabilityManagePage() {
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [newAvailability, setNewAvailability] = useState({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 30,
    });

    const [newTimeOff, setNewTimeOff] = useState({
        start_datetime: '',
        end_datetime: '',
        reason: '',
    });

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [availResponse, timeoffResponse] = await Promise.all([
                apiClient.get<Availability[]>('/appointments/doctor-availability/get'),
                apiClient.get<TimeOff[]>('/appointments/doctor-timeoff/get'),
            ]);

            if (availResponse.success) {
                setAvailabilities(availResponse.data || []);
            } else {
                setAvailabilities([]);
            }

            if (timeoffResponse.success) {
                setTimeOffs(timeoffResponse.data || []);
            } else {
                setTimeOffs([]);
            }
        } catch (err) {
            setError('Failed to load availability data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAvailability = async () => {
        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            if (newAvailability.start_time >= newAvailability.end_time) {
                setError('Start time must be before end time');
                setSubmitting(false);
                return;
            }

            if (isDayAlreadyScheduled(newAvailability.day_of_week)) {
                setError(`${DAYS_OF_WEEK[newAvailability.day_of_week]} already has a schedule. Only one schedule is allowed per day.`);
                setSubmitting(false);
                return;
            }

            const response = await apiClient.post<Availability>(
                '/appointments/doctor-availability/create',
                newAvailability
            );

            if (response.success) {
                setAvailabilities([...availabilities, response.data]);
                setNewAvailability({
                    day_of_week: 1,
                    start_time: '09:00',
                    end_time: '17:00',
                    slot_duration_minutes: 30,
                });
                setSuccess('Availability slot added successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to add availability');
            }
        } catch (err) {
            setError('An error occurred while adding availability');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAvailability = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this availability slot?')) {
            return;
        }

        try {
            setError('');
            const response = await apiClient.delete<ServerResponse>(
                `/appointments/doctor-availability/${id}`
            );

            if (response.success) {
                setAvailabilities(availabilities.filter((a) => a.id !== id));
                setSuccess('Availability slot deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to delete availability');
            }
        } catch (err) {
            setError('An error occurred while deleting availability');
            console.error(err);
        }
    };

    const handleAddTimeOff = async () => {
        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            if (!newTimeOff.start_datetime || !newTimeOff.end_datetime) {
                setError('Please fill in all required fields');
                setSubmitting(false);
                return;
            }

            const response = await apiClient.post<TimeOff>(
                '/appointments/doctor-timeoff/create',
                newTimeOff
            );

            if (response.success) {
                setTimeOffs([...timeOffs, response.data]);
                setNewTimeOff({
                    start_datetime: '',
                    end_datetime: '',
                    reason: '',
                });
                setSuccess('Time off period added successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to add time off');
            }
        } catch (err) {
            setError('An error occurred while adding time off');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTimeOff = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this time off period?')) {
            return;
        }

        try {
            setError('');
            const response = await apiClient.delete<ServerResponse>(
                `/appointments/doctor-timeoff/${id}`
            );

            if (response.success) {
                setTimeOffs(timeOffs.filter((t) => t.id !== id));
                setSuccess('Time off period deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to delete time off');
            }
        } catch (err) {
            setError('An error occurred while deleting time off');
            console.error(err);
        }
    };

    const formatTime = (timeStr: string): string => {
        return timeStr.substring(0, 5);
    };

    const formatDateTime = (dateTimeStr: string): string => {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAvailabilityByDay = (dayOfWeek: number): Availability[] => {
        return availabilities.filter((a) => a.day_of_week === dayOfWeek);
    };

    const isDayAlreadyScheduled = (dayOfWeek: number): boolean => {
        return availabilities.some((a) => a.day_of_week === dayOfWeek);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                <p className="text-sm text-gray-500">Loading your availability...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Page header */}
            <PageHeader title="Schedule" shortTitle="Manage Availability" description="Set your working hours and manage time off periods." />
            <div className="mx-auto p-4">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-900">Error</p>
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-green-900">Done</p>
                            <p className="text-green-800">{success}</p>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="Schedule">
                    <TabsList>
                        <TabsTrigger value="Schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="TimeOff">Time Off</TabsTrigger>
                    </TabsList>

                    {/* ── Schedule tab ── */}
                    <TabsContent value="Schedule">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">

                            {/* Day list */}
                            <div className="lg:col-span-2">
                                <Card className="p-5 border-gray-100 shadow-sm">
                                    <div className="space-y-2">
                                        {DAYS_OF_WEEK.map((day, dayIndex) => {
                                            const dayAvailabilities = getAvailabilityByDay(dayIndex);
                                            const hasSlots = dayAvailabilities.length > 0;
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className="flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="w-28 shrink-0 pt-0.5">
                                                        <p className="text-sm font-semibold text-gray-800">{day}</p>
                                                        {hasSlots && (
                                                            <span className="text-xs bg-purple-100 text-[#980194] px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                                                                {dayAvailabilities.length} slot{dayAvailabilities.length !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 space-y-1.5">
                                                        {hasSlots ? dayAvailabilities.map((avail) => (
                                                            <div
                                                                key={avail.id}
                                                                className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-3 py-2"
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {formatTime(avail.start_time)} – {formatTime(avail.end_time)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {avail.slot_duration_minutes}-min slots
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleDeleteAvailability(avail.id)}
                                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                                                    title="Delete slot"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <p className="text-xs text-gray-400 italic pt-0.5">Not scheduled</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>

                            {/* Add slot form */}
                            <div className="lg:col-span-1">
                                <Card className="p-5 border-gray-100 shadow-sm sticky top-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-[#980194] mb-3">Add Time Slot</p>

                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="day" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Day of Week
                                            </Label>
                                            <select
                                                id="day"
                                                value={newAvailability.day_of_week}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, day_of_week: parseInt(e.target.value) })}
                                                className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            >
                                                {DAYS_OF_WEEK.map((day, idx) => (
                                                    <option key={idx} value={idx}>{day}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="start-time" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Start Time
                                            </Label>
                                            <Input
                                                id="start-time"
                                                type="time"
                                                value={newAvailability.start_time}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="end-time" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                End Time
                                            </Label>
                                            <Input
                                                id="end-time"
                                                type="time"
                                                value={newAvailability.end_time}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="slot-duration" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Slot Duration
                                            </Label>
                                            <select
                                                id="slot-duration"
                                                value={newAvailability.slot_duration_minutes}
                                                onChange={(e) => setNewAvailability({ ...newAvailability, slot_duration_minutes: parseInt(e.target.value) })}
                                                className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            >
                                                <option value={15}>15 minutes</option>
                                                <option value={30}>30 minutes</option>
                                                <option value={45}>45 minutes</option>
                                                <option value={60}>1 hour</option>
                                                <option value={90}>1.5 hours</option>
                                                <option value={120}>2 hours</option>
                                            </select>
                                        </div>

                                        <Button
                                            onClick={handleAddAvailability}
                                            disabled={submitting || isDayAlreadyScheduled(newAvailability.day_of_week)}
                                            className="w-full bg-[#980194] hover:bg-[#7a0177] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <><Loader className="w-4 h-4 animate-spin mr-2" />Adding...</>
                                            ) : isDayAlreadyScheduled(newAvailability.day_of_week) ? (
                                                <><AlertCircle className="w-4 h-4 mr-2" />Already Scheduled</>
                                            ) : (
                                                <><Plus className="w-4 h-4 mr-2" />Add Time Slot</>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Time Off tab ── */}
                    <TabsContent value="TimeOff">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">

                            {/* Time off list */}
                            <div className="lg:col-span-2">
                                <Card className="p-5 border-gray-100 shadow-sm">
                                    {timeOffs.length > 0 ? (
                                        <div className="space-y-2">
                                            {timeOffs.map((timeoff) => (
                                                <div
                                                    key={timeoff.id}
                                                    className="flex items-start justify-between gap-3 border border-purple-100 bg-purple-50 rounded-xl px-4 py-3"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatDateTime(timeoff.start_datetime)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            to {formatDateTime(timeoff.end_datetime)}
                                                        </p>
                                                        {timeoff.reason && (
                                                            <p className="text-xs text-[#980194] mt-1.5 font-medium">
                                                                {timeoff.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteTimeOff(timeoff.id)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                            <CalendarOff className="w-8 h-8 text-gray-200" />
                                            <p className="text-sm text-gray-500">No time off periods scheduled.</p>
                                            <p className="text-xs text-gray-400">Add a period using the form on the right.</p>
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Add time off form */}
                            <div className="lg:col-span-1">
                                <Card className="p-5 border-gray-100 shadow-sm sticky top-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-[#980194] mb-3">Add Time Off</p>

                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="start-date" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Start Date & Time
                                            </Label>
                                            <Input
                                                id="start-date"
                                                type="datetime-local"
                                                value={newTimeOff.start_datetime}
                                                onChange={(e) => setNewTimeOff({ ...newTimeOff, start_datetime: e.target.value })}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="end-date" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                End Date & Time
                                            </Label>
                                            <Input
                                                id="end-date"
                                                type="datetime-local"
                                                value={newTimeOff.end_datetime}
                                                onChange={(e) => setNewTimeOff({ ...newTimeOff, end_datetime: e.target.value })}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="reason" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Reason (Optional)
                                            </Label>
                                            <Input
                                                id="reason"
                                                placeholder="e.g., Vacation, Medical Leave"
                                                value={newTimeOff.reason}
                                                onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                                                className="mt-1.5 border-gray-200 focus-visible:ring-purple-400 text-sm"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleAddTimeOff}
                                            disabled={submitting}
                                            className="w-full bg-[#980194] hover:bg-[#7a0177] text-white disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <><Loader className="w-4 h-4 animate-spin mr-2" />Adding...</>
                                            ) : (
                                                <><Plus className="w-4 h-4 mr-2" />Add Time Off</>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

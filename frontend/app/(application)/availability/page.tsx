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
    Clock,
    Calendar,
} from 'lucide-react';
import { a } from 'framer-motion/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your availability...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Availability</h1>
                    <p className="text-gray-600">
                        Set your working hours and manage time off periods
                    </p>
                </div>

                {/* Messages */}
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

                {success && (
                    <Card className="mb-6 p-4 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900">Success</h3>
                                <p className="text-green-800 text-sm">{success}</p>
                            </div>
                        </div>
                    </Card>
                )}

                <Tabs defaultValue="Schedule">
                    <TabsList>
                        <TabsTrigger value="Schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="TimeOff">Time Off</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Schedule">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Card className="p-6 bg-white shadow-sm border-0">
                                    <div className="space-y-4">
                                        {DAYS_OF_WEEK.map((day, dayIndex) => {
                                            const dayAvailabilities = getAvailabilityByDay(dayIndex);
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 min-w-32">
                                                            {day}
                                                        </h3>
                                                        {dayAvailabilities.length > 0 && (
                                                            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                                {dayAvailabilities.length} slot
                                                                {dayAvailabilities.length !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {dayAvailabilities.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {dayAvailabilities.map((avail) => (
                                                                <div
                                                                    key={avail.id}
                                                                    className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                                                                >
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">
                                                                            {formatTime(avail.start_time)} -{' '}
                                                                            {formatTime(avail.end_time)}
                                                                        </p>
                                                                        <p className="text-sm text-gray-600">
                                                                            {avail.slot_duration_minutes}-min slots
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteAvailability(avail.id)}
                                                                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic">Not available</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>

                            {/* Add Availability Form */}
                            <div className="lg:col-span-1">
                                <Card className="p-6 bg-white shadow-sm border-0 sticky top-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                        Add Time Slot
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="day" className="text-gray-700 font-medium">
                                                Day of Week
                                            </Label>
                                            <select
                                                id="day"
                                                value={newAvailability.day_of_week}
                                                onChange={(e) =>
                                                    setNewAvailability({
                                                        ...newAvailability,
                                                        day_of_week: parseInt(e.target.value),
                                                    })
                                                }
                                                className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {DAYS_OF_WEEK.map((day, idx) => (
                                                    <option key={idx} value={idx}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="start-time" className="text-gray-700 font-medium">
                                                Start Time
                                            </Label>
                                            <Input
                                                id="start-time"
                                                type="time"
                                                value={newAvailability.start_time}
                                                onChange={(e) =>
                                                    setNewAvailability({
                                                        ...newAvailability,
                                                        start_time: e.target.value,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="end-time" className="text-gray-700 font-medium">
                                                End Time
                                            </Label>
                                            <Input
                                                id="end-time"
                                                type="time"
                                                value={newAvailability.end_time}
                                                onChange={(e) =>
                                                    setNewAvailability({
                                                        ...newAvailability,
                                                        end_time: e.target.value,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="slot-duration"
                                                className="text-gray-700 font-medium"
                                            >
                                                Slot Duration (minutes)
                                            </Label>
                                            <select
                                                id="slot-duration"
                                                value={newAvailability.slot_duration_minutes}
                                                onChange={(e) =>
                                                    setNewAvailability({
                                                        ...newAvailability,
                                                        slot_duration_minutes: parseInt(e.target.value),
                                                    })
                                                }
                                                className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                                    Adding...
                                                </>
                                            ) : isDayAlreadyScheduled(newAvailability.day_of_week) ? (
                                                <>
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    Already Scheduled
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Time Slot
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div></TabsContent>
                    <TabsContent value="TimeOff">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Time Off List */}
                            <div className="lg:col-span-2">
                                <Card className="p-6 bg-white shadow-sm border-0">
                                    {timeOffs.length > 0 ? (
                                        <div className="space-y-3">
                                            {timeOffs.map((timeoff) => (
                                                <div
                                                    key={timeoff.id}
                                                    className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">
                                                                {formatDateTime(timeoff.start_datetime)}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                to {formatDateTime(timeoff.end_datetime)}
                                                            </p>
                                                            {timeoff.reason && (
                                                                <p className="text-sm text-orange-700 mt-2">
                                                                    Reason: {timeoff.reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteTimeOff(timeoff.id)}
                                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition flex-shrink-0"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">
                                            No time off periods scheduled
                                        </p>
                                    )}
                                </Card>
                            </div>

                            {/* Add Time Off Form */}
                            <div className="lg:col-span-1">
                                <Card className="p-6 bg-white shadow-sm border-0 sticky top-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-orange-600" />
                                        Add Time Off
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <Label
                                                htmlFor="start-date"
                                                className="text-gray-700 font-medium"
                                            >
                                                Start Date & Time
                                            </Label>
                                            <Input
                                                id="start-date"
                                                type="datetime-local"
                                                value={newTimeOff.start_datetime}
                                                onChange={(e) =>
                                                    setNewTimeOff({
                                                        ...newTimeOff,
                                                        start_datetime: e.target.value,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="end-date"
                                                className="text-gray-700 font-medium"
                                            >
                                                End Date & Time
                                            </Label>
                                            <Input
                                                id="end-date"
                                                type="datetime-local"
                                                value={newTimeOff.end_datetime}
                                                onChange={(e) =>
                                                    setNewTimeOff({
                                                        ...newTimeOff,
                                                        end_datetime: e.target.value,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="reason" className="text-gray-700 font-medium">
                                                Reason (Optional)
                                            </Label>
                                            <Input
                                                id="reason"
                                                placeholder="e.g., Vacation, Medical Leave"
                                                value={newTimeOff.reason}
                                                onChange={(e) =>
                                                    setNewTimeOff({
                                                        ...newTimeOff,
                                                        reason: e.target.value,
                                                    })
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleAddTimeOff}
                                            disabled={submitting}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Time Off
                                                </>
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

import AppointmentsPanel from "./AppointmentsPanel";
import SummaryCards from "./SummaryCards";
import TipsExercises from "./TipsExercises";
import TrendOverview from "./TrendOverview";
import { Appointment, SummaryCard, Tip } from "./types";

export default function UserDashboard() {
    const summaryCards: SummaryCard[] = [
        { title: "Current Anxiety Level", value: "01" },
        { title: "Current Depression Level", value: "02" },
        { title: "Current Stress Level", value: "02" },
    ];

    const appointments: Appointment[] = [
        { id: "1", doctor: "Dr. Liam Patel", date: "06-12-2026", time: "2:00 PM", status: "Pending" },
        { id: "2", doctor: "Dr. Liam Patel", date: "31-11-2026", time: "2:00 PM", status: "Completed" },
        { id: "3", doctor: "Dr. Liam Patel", date: "06-12-2026", time: "2:00 PM", status: "Canceled" },
    ];

    const tips: Tip[] = [
        { bold: "Start your morning calmly", light: "take 3–5 deep breaths before checking your phone" },
        { bold: "Move your body daily", light: "even a 10–20 minute walk helps clear your mind" },
        { bold: "Avoid your phone 30 minutes before sleep", light: "Limit screen time at night to improve sleep quality" },
        { bold: "Stay hydrated", light: "dehydration can affect mood and focus" },
        { bold: "Listen to calming music", light: "Listen to calming or uplifting music when feeling overwhelmed" },
        { bold: "Stretch or do light exercise", light: "Stretch or do light exercise to release tension" },
    ];

    return (
        <div
            className="w-full min-h-screen p-4 sm:p-6 overflow-x-hidden"
            style={{
    background: "transparent",
}}
        >
            <div className="w-full max-w-[1100px] mx-auto">
                <h1 className="text-2xl font-semibold text-[#151515] mb-4 tracking-tight bg-transparent">
                    Mental Health Dashboard
                </h1>

                <div className="w-full rounded-2xl border border-[#e0dada] bg-white/80 backdrop-blur-sm p-4 shadow-sm">

                    <SummaryCards summaryCards={summaryCards} />

                    <div className="grid grid-cols-3 gap-4 mb-4 items-stretch">
                        <TrendOverview />
                        <AppointmentsPanel appointments={appointments} />
                    </div>

                    <TipsExercises tips={tips} />

                </div>
            </div>
        </div>
    );
}
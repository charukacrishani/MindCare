import { useEffect, useState } from "react";
import AppointmentsPanel from "./AppointmentsPanel";
import SummaryCards from "./SummaryCards";
import TipsExercises from "./TipsExercises";
import TrendOverview, { TrendData } from "./TrendOverview";
import { Appointment, SummaryCard, Tip } from "./types";
import { apiClient } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";

export default function UserDashboard() {
    const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
    const [tips, setTips] = useState<Tip[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        loadSummaryCards();
        loadTips();
        loadTrendData();
        loadAppointments();
    }, []);

    const loadSummaryCards = async () => {
        try {
            const response = await apiClient.get<{
                anxiety_score: number,
                depression_score: number,
                stress_score: number
            }>("/dashboard/users/current");
            const { anxiety_score, depression_score, stress_score } = response.data;
            setSummaryCards([
                { title: "Anxiety Score", value: anxiety_score.toString() },
                { title: "Depression Score", value: depression_score.toString() },
                { title: "Stress Score", value: stress_score.toString() },
            ]);
        } catch (error) {
            console.error("Error fetching summary cards:", error);
            setSummaryCards([
                { title: "Anxiety Score", value: "0" },
                { title: "Depression Score", value: "0" },
                { title: "Stress Score", value: "0" },
            ]);
        }
    };

    const loadTips = async () => {
        try {
            const response = await apiClient.get<Tip[]>("/dashboard/users/tips");
            setTips(response.data);
        } catch (error) {
            console.error("Error fetching tips:", error);
            setTips([
                { bold: "Practice Mindfulness", light: "Engage in mindfulness exercises to reduce stress and improve mental clarity." },
                { bold: "Stay Active", light: "Regular physical activity can boost your mood and overall mental health." },
                { bold: "Connect with Others", light: "Maintain social connections to combat feelings of loneliness and isolation." },
            ]);
        }
    };

    const loadTrendData = async () => {
        try {
            const response = await apiClient.get<TrendData[]>("/dashboard/users/trend");
            setTrendData(response.data);
        } catch (error) {
            console.error("Error fetching trend data:", error);
            setTrendData([
                { anxiety_score: 0, depression_score: 0, stress_score: 0, date: "Day 1" },
                { anxiety_score: 0, depression_score: 0, stress_score: 0, date: "Day 2" },
                { anxiety_score: 0, depression_score: 0, stress_score: 0, date: "Day 3" },
                { anxiety_score: 0, depression_score: 0, stress_score: 0, date: "Day 4" },
                { anxiety_score: 0, depression_score: 0, stress_score: 0, date: "Day 5" },
            ]);
        }
    }

    const loadAppointments = async () => {
        try {
            const response = await apiClient.get<Appointment[]>("/dashboard/users/appointments");
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-[linear-gradient(180deg,#faf7f4_0%,#f3f0ec_100%)]">
            <div className="mx-auto w-full px-4">
                <PageHeader title="Dashboard" shortTitle="Your Mental Health" description="Track your progress, review upcoming sessions, and follow practical wellness actions." />


                <div className="w-full rounded-2xl border border-[#ddd4cd] bg-white/85 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:p-5">
                    <SummaryCards summaryCards={summaryCards} />

                    <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <TrendOverview data={trendData} />
                        <AppointmentsPanel appointments={appointments} />
                    </div>

                    <TipsExercises tips={tips} />
                </div>
            </div>
        </div>
    );
}
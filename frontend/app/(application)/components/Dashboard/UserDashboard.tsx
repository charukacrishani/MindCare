import { useEffect, useState } from "react";
import AppointmentsPanel from "./AppointmentsPanel";
import SummaryCards from "./SummaryCards";
import TipsExercises from "./TipsExercises";
import TrendOverview, { TrendData } from "./TrendOverview";
import { Appointment, SummaryCard, Tip } from "./types";
import { apiClient } from "@/lib/apiClient";

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
                { title: "Depression Score", value: depression_score.toString()},
                { title: "Stress Score", value: stress_score.toString()},
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
        <div
            className="w-full h-full flex flex-col p-4 sm:p-6 overflow-hidden"
            style={{
    background: "transparent",
}}
        >
            <div className="w-full max-w-[1100px] mx-auto flex flex-col h-full">
                <h1 className="text-2xl font-semibold text-[#151515] mb-4 tracking-tight bg-transparent">
                    Mental Health Dashboard
                </h1>

                <div className="w-full flex-1 rounded-2xl border border-[#e0dada] bg-white/80 backdrop-blur-sm p-4 shadow-sm overflow-y-auto">

                    <SummaryCards summaryCards={summaryCards} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-stretch">
                        <TrendOverview data={trendData} />
                        <AppointmentsPanel appointments={appointments} />
                    </div>

                    <TipsExercises tips={tips} />

                </div>
            </div>
        </div>
    );
}
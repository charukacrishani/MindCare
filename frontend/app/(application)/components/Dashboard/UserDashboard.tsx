import { useEffect, useState } from "react";
import AppointmentsPanel from "./AppointmentsPanel";
import SummaryCards from "./SummaryCards";
import TipsExercises from "./TipsExercises";
import TrendOverview, { TrendData } from "./TrendOverview";
import { Appointment, SummaryCard, Tip } from "./types";
import { apiClient } from "@/lib/apiClient";
import { PageHeader } from "@/components/PageHeader";
import { useRouter } from "next/navigation";

type Counselor = {
    userid: string;
    full_name: string;
    review_count: number;
    avatar: string;
}

export default function UserDashboard() {
    const router = useRouter();
    const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
    const [tips, setTips] = useState<Tip[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [suggestCounselors, setSuggestCounselors] = useState(false);
    const [counselors, setCounselors] = useState<Counselor[]>([]);

    useEffect(() => {
        loadSummaryCards();
        loadTips();
        loadTrendData();
        loadAppointments();
    }, []);

    useEffect(() => {
        if (suggestCounselors) {
            loadCounselors();
        }
    }, [suggestCounselors]);

    const loadCounselors = async () => {
        try {
            const response = await apiClient.get<Counselor[]>("/dashboard/users/counselors");
            setCounselors(response.data);
        } catch (error) {
            console.log("Error fetching counselors:", error);
        }
    }

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
            if (anxiety_score > 2 || depression_score > 2 || stress_score > 2) {
                setSuggestCounselors(true);
            }
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
        <div className="w-full h-full overflow-y-auto">
            <div className="mx-auto w-full">
                <PageHeader title="Dashboard" shortTitle="Your Mental Health" description="Track your progress, review upcoming sessions, and follow practical wellness actions." />

                <div className="p-4">
                    <div className="w-full rounded-2xl border border-gray-200 bg-white/85 p-3 shadow-sm backdrop-blur-sm sm:p-4 lg:p-5">
                        <SummaryCards summaryCards={summaryCards} />
                        {suggestCounselors && counselors.length > 0 && (
                            <div className="mb-4">
                                <h3 className="mb-4 font-semibold text-gray-800">
                                    Suggested Counselors
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {counselors.map((c) => (
                                        <div
                                            key={c.userid}
                                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${c.avatar}`}
                                                alt={c.full_name}
                                                className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100"
                                            />

                                            <div className="flex-1">
                                                <div className="text-base font-semibold text-gray-900 group-hover:text-[#980194] transition-colors">
                                                    {c.full_name}
                                                </div>

                                                <div className="mt-1 text-sm text-gray-500">
                                                    {c.review_count} reviews
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => router.push(`/counselors/${c.userid}/view`)}
                                                className="rounded-lg bg-[#980194] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a0177] hover:shadow-md active:scale-95"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <TrendOverview data={trendData} />
                            <AppointmentsPanel appointments={appointments} />
                        </div>

                        <TipsExercises tips={tips} />
                    </div>
                </div>
            </div>
        </div>
    );
}

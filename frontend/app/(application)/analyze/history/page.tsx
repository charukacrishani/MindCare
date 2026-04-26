"use client";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { Loader, BarChart2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export interface QuestionnaireResponse {
    id: string;
    userid: string;
    depression_score: number;
    anxiety_score: number;
    stress_score: number;
    date: string;
}

export default function AnalyzeHistoryPage() {
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get<QuestionnaireResponse[]>("/questionnaire/");
                if (response.success) {
                    setResponses(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch questionnaire responses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full">

            <PageHeader title="Assessment History" shortTitle="Your Past Results" description="Review your past DASS-21 assessment results, track your progress over time, and gain insights into your mental health journey." />

            <div className="p-4">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                        <p className="text-sm text-gray-500">Loading results...</p>
                    </div>
                ) : responses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                        <BarChart2 className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-500">No assessments completed yet.</p>
                        <p className="text-sm text-gray-400">Complete the DASS-21 questionnaire to see your results here.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {responses.map((response, idx) => (
                            <li
                                key={response.id}
                                className="p-5 border border-gray-100 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                            >
                                {/* Card header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-[#980194]">
                                            Session {responses.length - idx}
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 mt-0.5">
                                            {new Date(response.date).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(response.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {/* Score grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Depression</p>
                                        <p className="text-2xl font-semibold text-red-600 leading-none">
                                            {response.depression_score}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Anxiety</p>
                                        <p className="text-2xl font-semibold text-yellow-600 leading-none">
                                            {response.anxiety_score}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Stress</p>
                                        <p className="text-2xl font-semibold text-[#980194] leading-none">
                                            {response.stress_score}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

    );
}

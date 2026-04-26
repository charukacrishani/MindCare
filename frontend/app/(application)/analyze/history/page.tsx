"use client";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

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
        }
        fetchData();
    }, []);

    return (
        <div className="w-full flex flex-col items-center py-10 px-4">

            <h1 className="text-2xl font-bold mb-8">Analyze History</h1>

            <div className="w-full max-w-3xl">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <ul className="space-y-4">
                        {responses.map((response) => (
                            <li
                                key={response.id}
                                className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                            >
                                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <p className="text-gray-500">Depression</p>
                                        <p className="text-lg font-semibold text-red-600">
                                            {response.depression_score}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-gray-500">Anxiety</p>
                                        <p className="text-lg font-semibold text-yellow-600">
                                            {response.anxiety_score}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-gray-500">Stress</p>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {response.stress_score}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400">
                                    {new Date(response.date).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    )
}
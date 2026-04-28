'use client';
import { PatientChatHistory } from "@/components/PatientChatHistory";
import { PreviousAppointments } from "@/components/PreviousAppointments";
import { ChevronRight, Loader } from "lucide-react";
import Link from "next/link";
import { PatientProfileCard, PatientStatistics } from "@/components/PatientProfileCard";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from "@/components/PageHeader";

type Patient = {
  name: string;
  age: number;
  imageSrc: string;
  description: string;
}

type StatisticEntry = {
  dateRange: string;
  anxiety: number;
  depression: number;
  stress: number;
}

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
}

type AppointmentItem = {
  id: string;
  date: string;
  time: string;
}

type PatientOverviewResponse = {
  patient: Patient;
  statistics: StatisticEntry[];
  appointments: AppointmentItem[];
  chat: {
    date: string;
    messages: ChatMessage[];
  };
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [patient, setPatient] = useState<Patient>({ name: "", age: 0, imageSrc: "", description: "" });
  const [statistics, setStatistics] = useState<StatisticEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatDate, setChatDate] = useState<string>("");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<PatientOverviewResponse>(`/patients/${id}/overview`);
      const overview = response.data;

      setPatient(overview.patient);
      setStatistics(overview.statistics ?? []);
      setAppointments(overview.appointments ?? []);
      setMessages(overview.chat?.messages ?? []);
      setChatDate(overview.chat?.date ? new Date(overview.chat.date).toLocaleDateString() : "No chat data");
    } catch (error) {
      setPatient({ name: "Unknown Patient", age: 0, imageSrc: "", description: "" });
      setStatistics([]);
      setAppointments([]);
      setMessages([]);
      setChatDate("No chat data");
      setError("Failed to load patient data.");
      console.error("Failed to load patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title={!loading && patient.name ? patient.name : "Patient Details"}
        shortTitle="Patients"
        description="View patient profile, statistics, appointments, and chat history."
      />

      <div className="px-4 pb-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 animate-spin text-[#980194]" />
            <p className="text-sm text-gray-500">Loading patient details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-[#980194] transition-colors">
                Patients
              </Link>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-800 font-medium">{patient?.name}</span>
            </div>

            <Tabs defaultValue="Profile" className="w-full">
              <TabsList className="mb-6 bg-gray-100/80 p-1 rounded-xl h-auto gap-1">
                {["Profile", "Statistics", "Appointments", "ChatHistory"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#980194] data-[state=active]:shadow-sm"
                  >
                    {tab === "ChatHistory" ? "Chat History" : tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="Profile">
                <PatientProfileCard {...patient} />
              </TabsContent>
              <TabsContent value="Statistics">
                <PatientStatistics stats={statistics} />
              </TabsContent>
              <TabsContent value="Appointments">
                <PreviousAppointments appointments={appointments} />
              </TabsContent>
              <TabsContent value="ChatHistory">
                <PatientChatHistory date={chatDate} messages={messages} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

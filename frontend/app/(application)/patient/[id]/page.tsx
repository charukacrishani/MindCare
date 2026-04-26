'use client';
import { PatientChatHistory } from "@/components/PatientChatHistory";
import { PreviousAppointments } from "@/components/PreviousAppointments";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PatientProfileCard, PatientStatistics } from "@/components/PatientProfileCard";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    if (!id) {
      return;
    }

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
  }

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-400 via-pink-300 to-purple-200 z-50" />

      <main className="flex-1 p-8 pb-16">
        {loading && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Loading patient details...
          </div>
        )}

        {!loading && error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/"
            className="hover:text-gray-800 transition-colors"
          >
            Patients
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-medium">{patient?.name}</span>
        </div>

        <Tabs defaultValue="Profile" className="w-full">
          <TabsList>
            <TabsTrigger value="Profile">Profile</TabsTrigger>
            <TabsTrigger value="Statistics">Statistics</TabsTrigger>
            <TabsTrigger value="Appointments">Appointments</TabsTrigger>
            <TabsTrigger value="ChatHistory">Chat History</TabsTrigger>
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

        {/* Bottom section */}
        <div className="grid grid-cols-2 gap-4">
        </div>
      </main>
    </div>
  );
}

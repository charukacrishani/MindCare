import { PatientChatHistory } from "@/components/PatientChatHistory";
import { PreviousAppointments } from "@/components/PreviousAppointments";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PatientProfileCard } from "@/components/PatientProfileCard";

// Mock data — replace with real fetch by `id`
const patient = {
  name: "Chandler Bing",
  age: 27,
  imageSrc: "/patients/chandler.jpg",
  description:
    "Lying awake at night with a racing mind, constant thoughts, or quiet worries that make it hard to relax. Even when the body feels tired, the mind stays active, causing restlessness, frustration, and broken sleep.",
};

const statistics = [
  {
    dateRange: "01/12/2026 – 12/12/2026",
    anxiety: 1,
    depression: 2,
    stress: 2,
  },
  {
    dateRange: "25/11/2026 – 31/11/2026",
    anxiety: 1,
    depression: 3,
    stress: 3,
  },
];

const messages = [
  {
    id: "1",
    sender: "patient",
    text: "Hi... I don't really feel okay lately.",
  },
  {
    id: "2",
    sender: "counselor",
    text: "Thank you for sharing that. You don't have to explain everything at once. Let's take this step by step. Can you tell me what you've been feeling most often recently?",
  },
  {
    id: "3",
    sender: "patient",
    text: "I feel tired all the time and I don't feel motivated.",
  },
  {
    id: "4",
    sender: "counselor",
    text: "Have you been getting enough rest or sleep lately?",
  },
  { id: "5", sender: "patient", text: "Not really. My sleep is messed up." },
  {
    id: "6",
    sender: "counselor",
    text: "Sleep plays a big role in how we feel mentally and emotionally.",
  },
  {
    id: "7",
    sender: "patient",
    text: "I know, but even when I try to sleep early I just stare at the ceiling.",
  },
  {
    id: "8",
    sender: "counselor",
    text: "That sounds really frustrating. Have you noticed any particular thoughts that come up when you can't sleep?",
  },
  {
    id: "9",
    sender: "patient",
    text: "Yeah, I keep thinking about work and whether I'm doing enough.",
  },
  {
    id: "10",
    sender: "counselor",
    text: "It sounds like you might be putting a lot of pressure on yourself. How long has this been going on?",
  },
  {
    id: "11",
    sender: "patient",
    text: "Maybe 3 or 4 months now. It started after I got a new manager.",
  },
  {
    id: "12",
    sender: "counselor",
    text: "That's a significant change. Has your relationship with your new manager been stressful for you?",
  },
  {
    id: "13",
    sender: "patient",
    text: "Kind of. I feel like nothing I do is ever good enough for them.",
  },
  {
    id: "14",
    sender: "counselor",
    text: "Feeling unappreciated at work can really take a toll on your mental health. Do you have people around you that you can talk to about this?",
  },
  {
    id: "15",
    sender: "patient",
    text: "Not really. I don't want to burden my friends with my problems.",
  },
  {
    id: "16",
    sender: "counselor",
    text: "You're not a burden. Reaching out is actually a sign of strength. I'm glad you're here today.",
  },
];

const appointments = Array.from({ length: 7 }, (_, i) => ({
  id: String(i + 1),
  date: "12-12-2026",
  time: "2:00 PM",
}));

export default function PatientDetailPage() {
  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-200 z-50" />

      <main className="flex-1 p-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/"
            className="hover:text-gray-800 transition-colors"
          >
            Patients
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-medium">{patient.name}</span>
        </div>

        {/* Top section */}
        <div className="mb-4">
          <PatientProfileCard {...patient} stats={statistics} />
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-2 gap-4">
          <PatientChatHistory date="12-12-2026" messages={messages} />
          <PreviousAppointments appointments={appointments} />
        </div>
      </main>
    </div>
  );
}

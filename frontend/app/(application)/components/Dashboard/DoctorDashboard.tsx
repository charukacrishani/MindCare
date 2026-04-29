import React from "react";
import { AppointmentsTable } from "./AppointmentsTable";
import { Sidebar } from "../../../../components/Sidebar";
import { PatientsTable } from "./PatientsTable";
import { PageHeader } from "@/components/PageHeader";

export default function DoctorDashboard() {
    const [activeTab, setActiveTab] = React.useState("appointments");

    const handleOnTabChange = (tab: string) => {
        setActiveTab(tab);
    }

    return (
        <div className="h-full flex flex-col">
            <PageHeader title="Dashboard" shortTitle="Doctor's Dashboard" description="Manage your appointments and patient information efficiently." />

            {/* Mobile tab bar — visible only on small screens */}
            <div className="flex md:hidden border-b border-gray-200 bg-white shrink-0">
                {["Appointments", "Patients"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleOnTabChange(tab.toLowerCase())}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.toLowerCase()
                                ? "border-[#980194] text-[#980194]"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 w-full bg-gray-50/80 overflow-hidden">
                {/* Top accent gradient */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-400 via-pink-300 to-purple-200 z-50" />

                <Sidebar activeTab={activeTab} onTabChange={handleOnTabChange} />

                <main className="flex-1 overflow-y-auto">
                    {activeTab === "appointments" && <AppointmentsTable />}
                    {activeTab === "patients" && <PatientsTable />}
                </main>
            </div>
        </div>

    )
}
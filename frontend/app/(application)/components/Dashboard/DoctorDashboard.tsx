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
            <div className="flex flex-1 w-full bg-gray-50/80 overflow-hidden">
                {/* Top accent gradient */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-300 to-purple-200 z-50" />

                <Sidebar activeTab={activeTab} onTabChange={handleOnTabChange} />

                <main className="flex-1 overflow-y-auto">
                    {activeTab === "appointments" && <AppointmentsTable />}
                    {activeTab === "patients" && <PatientsTable />}
                </main>
            </div>
        </div>

    )
}
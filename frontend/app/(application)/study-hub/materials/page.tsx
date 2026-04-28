'use client';
import { PageHeader } from "@/components/PageHeader";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { Loader, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Material = {
    id: number;
    title: string;
    description: string;
    author: string;
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await apiClient.get<Material[]>('/study-hub/resources');
            setMaterials(response.data);
        } catch (error) {
            console.log("Error fetching materials:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleViewResource = async (materialId: number, title: string) => {
        try {
            const response = await fetch(`/api/study-hub/resources/${materialId}`);

            if (!response.ok) {
                console.error('Failed to fetch resource');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading resource:', error);
        }
    }

    return (
        <div className="w-full mx-auto">
            <PageHeader title="Material Resources" shortTitle="Material Resources" description="Access a collection of educational materials on mental health and self-care techniques." />
            <div className="p-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                        <p className="text-sm text-gray-500">Loading materials...</p>
                    </div>
                )}
                {!loading && materials.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
                        <FileText className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-500">No materials available at the moment.</p>
                        <p className="text-sm text-gray-400">Check back soon for new resources.</p>
                    </div>
                )}
                {!loading && materials.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materials.map((material, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
                                <h3 className="text-base font-semibold text-gray-900">{material.title}</h3>
                                <p className="text-sm text-gray-600 flex-1">{material.description}</p>
                                <p className="text-xs text-gray-500">Author: {material.author}</p>
                                <Button
                                    onClick={() => handleViewResource(material.id, material.title)}
                                    className="w-full bg-[#980194] hover:bg-[#7a0177] text-white"
                                >
                                    View PDF
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

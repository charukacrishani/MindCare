'use client';
import { PageHeader } from "@/components/PageHeader";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

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
            <div className="p-4 md:p-6 lg:p-8">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
                            <p className="text-gray-600">Loading materials...</p>
                        </div>
                    </div>
                )}
                {!loading && materials.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No materials available at the moment.</p>
                    </div>
                )}
                {!loading && materials.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                                <p className="text-gray-700 mb-4">{material.description}</p>
                                <p className="text-sm text-gray-500 mb-4">Author: {material.author}</p>
                                <button
                                    onClick={() => handleViewResource(material.id, material.title)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    View PDF
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
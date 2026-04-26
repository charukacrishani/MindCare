"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, ServerResponse } from "@/lib/apiClient";

type PersonalDataForm = {
    allowChatHistory: boolean;
    allowPersonalData: boolean;
}

export default function PersonalDataPopup({ isOpen, onClose, appointmentId }: { isOpen: boolean; onClose: () => void; appointmentId: string }) {
    const [form, setForm] = useState({
        allowChatHistory: false,
        allowPersonalData: false,
    });

    useEffect(() => {
        loadData();
    }, [appointmentId]);

    const loadData = async () => {
        try {
            const response = await apiClient.get<PersonalDataForm>(`/data-consent/${appointmentId}`);
            setForm(response.data);
        } catch (error) {
            console.error("Error loading data consent:", error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setForm({ ...form, [name]: checked });
    }

    const onClosePopup = async () => {
        try {
            const response = await apiClient.post<ServerResponse>(`/data-consent/${appointmentId}`, form);
            if (response.success) {
                onClose();
            }
        } catch (error) {
            console.error("Error saving data consent:", error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Dialog open={isOpen} onOpenChange={onClosePopup}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Personal Data Consent</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-1">
                            <Label>Allow Chat History</Label>
                            <Input
                                type="checkbox"
                                name="allowChatHistory"
                                checked={form.allowChatHistory}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Allow Personal Data</Label>
                            <Input
                                type="checkbox"
                                name="allowPersonalData"
                                checked={form.allowPersonalData}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

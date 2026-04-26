'use client';
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { Message } from "../page";
import { Loader, MessageSquare, User } from "lucide-react";
import Image from "next/image";

interface ChatHistory {
    chatid: string;
    userid: string;
    date: Date;
    active: boolean;
}

export default function ChatHistoryPage() {
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get<ChatHistory[]>("/chats/");
                if (response.success) {
                    setChatHistory(response.data);
                    setSelectedChatId(response.data.length > 0 ? response.data[0].chatid : null);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChatHistory();
    }, []);

    useEffect(() => {
        if (!selectedChatId) return;
        setChatLoading(true);
        const loadChatMessages = async () => {
            try {
                const response = await apiClient.get<{ chatid: string; messages: { questionid: string; content: string; role: string }[] }>(
                    "/chats/messages",
                    { chatid: selectedChatId }
                );
                if (response.success) {
                    setMessages(
                        response.data.messages.map((msg) => ({
                            id: msg.questionid,
                            text: msg.content,
                            sender: msg.role === "user" ? "user" : "bot",
                            timestamp: Date.now(),
                        } as Message))
                    );
                }
            } catch (error) {
                console.error("Error fetching chat messages:", error);
            } finally {
                setChatLoading(false);
            }
        };
        loadChatMessages();
    }, [selectedChatId]);

    return (
        <div className="w-full h-full flex flex-col p-4 md:p-6">

            {/* Page header */}
            <div className="mb-4 shrink-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#980194]">Chat</p>
                <h1 className="text-2xl font-semibold text-gray-900 mt-1">Conversation History</h1>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <Loader className="w-8 h-8 animate-spin text-[#980194]" />
                    <p className="text-sm text-gray-500">Loading conversations...</p>
                </div>
            ) : chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-200" />
                    <p className="text-gray-500">No conversations yet.</p>
                    <p className="text-sm text-gray-400">Start a chat to see your history here.</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex gap-4">

                    {/* Session list */}
                    <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
                        {chatHistory.map((chat, idx) => {
                            const active = selectedChatId === chat.chatid;
                            return (
                                <button
                                    key={chat.chatid}
                                    onClick={() => setSelectedChatId(chat.chatid)}
                                    className={`w-full text-left p-3 rounded-xl border transition-colors
                                        ${active
                                            ? "border-[#980194] bg-purple-50"
                                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                        Session {chatHistory.length - idx}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {new Date(chat.date).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(chat.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium
                                        ${chat.active
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {chat.active ? "Active" : "Completed"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Messages panel */}
                    <div className="flex-1 min-w-0 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
                        {!selectedChatId ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center p-8">
                                <MessageSquare className="w-8 h-8 text-gray-200" />
                                <p className="text-sm text-gray-400">Select a session to view messages.</p>
                            </div>
                        ) : chatLoading ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                <Loader className="w-6 h-6 animate-spin text-[#980194]" />
                                <p className="text-sm text-gray-400">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center p-8">
                                <p className="text-sm text-gray-400">No messages in this session.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((message) =>
                                    message.sender === "bot" ? (
                                        <div key={message.id} className="flex justify-start">
                                            <div className="max-w-[75%] bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2">
                                                <div className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                                                    <Image src="/images/logo3.png" alt="Bot" width={20} height={20} className="object-contain" />
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={message.id} className="flex justify-end">
                                            <div className="max-w-[75%] rounded-xl px-4 py-3 shadow-sm flex gap-3 items-start bg-linear-to-r from-white from-70% via-[#FF96FC]/10 to-[#FF96FC]/20">
                                                <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>
                                                <div className="w-7 h-7 rounded-full bg-[#FF96FC] flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

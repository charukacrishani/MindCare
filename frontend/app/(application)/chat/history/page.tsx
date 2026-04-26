'use client';
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react"
import { Message } from "../page";

interface ChatHistory {
    chatid: string,
    userid: string,
    date: Date,
    active: boolean
}

export default function ChatHistoryPage() {
    const [refreshKey, setRefreshKey] = useState(0);
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
                    console.log("Chat history:", response.data);
                    setChatHistory(response.data)
                    setSelectedChatId(response.data.length > 0 ? response.data[0].chatid : null);
                } else {
                    console.error("Failed to fetch chat history:", response.message);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchChatHistory();
    }, [refreshKey]);

    const handleChatClick = (chatid: string) => {
        setSelectedChatId(chatid);
    }

    useEffect(() => {
        if (selectedChatId) {
            setChatLoading(true)
            const loadChatMessages = async () => {
                try {
                    const response = await apiClient.get<{ chatid: string; messages: { questionid: string; content: string; role: string; }[] }>("/chats/messages", { chatid: selectedChatId });
                    if (response.success) {
                        console.log("Chat messages for chatid", selectedChatId, ":", response.data);
                        setMessages(response.data.messages.map((msg) => ({
                            id: msg.questionid,
                            text: msg.content,
                            sender: msg.role === "user" ? "user" : "bot",
                            timestamp: Date.now(),
                        } as Message)));
                    } else {
                        console.error("Failed to fetch chat messages:", response.message);
                    }
                } catch (error) {
                    console.error("Error fetching chat messages:", error);
                } finally {
                    setChatLoading(false)
                }
            }
            loadChatMessages();
        }
    }, [selectedChatId])

    return (
        <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-2 mt-3">Chat History</h1>
            <p className="text-gray-600 mb-4">Review your past conversations.</p>
            {loading ? (
                <p className="text-gray-500">Loading chat history...</p>
            ) : (
                <div className="flex flex-row gap-4">
                    <div className="shrink-0">
                        <ul className="space-y-2 w-72">
                            {chatHistory.map((chat) => (
                                <li
                                    key={chat.chatid}
                                    onClick={() => handleChatClick(chat.chatid)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-colors ${selectedChatId === chat.chatid ? "border-[#980194] bg-purple-50" : "hover:bg-gray-50"}`}
                                >
                                    <p className="text-sm"><strong>{new Date(chat.date).toLocaleString()}</strong></p>
                                    <p className="text-xs text-gray-500 mt-1">{chat.active ? "Active" : "Completed"}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {selectedChatId && (
                        <div className="flex-1">
                            {chatLoading ? (
                                <p className="text-gray-500">Loading messages...</p>
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm text-gray-800 ${message.sender === "user"
                                                        ? "bg-linear-to-r from-white from-70% via-[#FF96FC]/10 to-[#FF96FC]/20"
                                                        : "bg-white border border-gray-100"
                                                    }`}
                                            >
                                                <span
                                                    className={`text-xs font-semibold px-2 py-0.5 mr-2 rounded-md text-white ${message.sender === "user" ? "bg-[#980194]" : "bg-gray-500"}`}
                                                >
                                                    {message.sender === "user" ? "You" : "Bot"}
                                                </span>
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
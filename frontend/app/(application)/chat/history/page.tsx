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
        <div>
            <h1 className="text-2xl font-bold mb-2 mt-3">Chat History</h1>
            <p className="text-gray-600 mb-4">This is where your chat history will be displayed.</p>
            {loading ? (
                <p>Loading chat history...</p>
            ) : (
                <div className="p-4 flex flex-row gap-4">
                    <div>
                        <ul className="space-y-2 w-96">
                            {chatHistory.map((chat) => (
                                <li key={chat.chatid} onClick={() => handleChatClick(chat.chatid)} className="p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                                    <p><strong> {new Date(chat.date).toLocaleString()}</strong> - {chat.active ? "Active" : "Inactive"}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {selectedChatId && (
                        <div>
                            {chatLoading ? (
                                <p>Loading chat messages...</p>
                            ) : (
                                <div className="space-y-2">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-xl shadow-sm ${message.sender === "user"
                                                        ? "bg-blue-100"
                                                        : "bg-gray-100"
                                                    }`}
                                            >
                                                <p className="text-sm text-gray-800">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-1 mr-2 rounded-md text-white ${message.sender === "user" ? "bg-blue-600" : "bg-gray-600"
                                                            }`}
                                                    >
                                                        {message.sender === "user" ? "User" : "Bot"}
                                                    </span>
                                                    {message.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
            }
        </div>
    )
}
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef } from "react";
import { HistoryIcon, RefreshCw, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { guid } from "@/lib/generateguid";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/dist/client/components/navigation";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: number;
}

interface MessageSubmitReq {
  initialquestion: string | null
  questionid: string
  answertext: string
}

// Bot Message Component
export function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-md px-4 py-3 bg-white text-gray-900 flex flex-col gap-3 items-start shadow-xl">
        <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image
            src="/images/logo3.png"
            alt="Bot"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm leading-relaxed pt-1">{text}</p>
      </div>
    </div>
  );
}

// User Message Component
export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] shadow-lg rounded-md px-4 py-3
  bg-gradient-to-r 
  from-white from-[70%] 
  via-[#FF96FC]/10 via-[85%]
  to-[#FF96FC]/20
  text-black flex gap-3 items-start"
      >
        <p className="text-sm leading-relaxed pt-1">{text}</p>
        <div className="w-8 h-8 rounded-full bg-[#FF96FC] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const initialquestion = "Hello! I'm here to understand how you've been feeling lately. To start, what did you do most during your day today?"

export default function Page() {
  const router = useRouter();
  const [chatid, setChatid] = useState<string | null>(null)
  const [questionid, setQuestionid] = useState<string>(guid())
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatDone, setIsChatDone] = useState(false);

  useEffect(() => {
    initHomepage();
  }, []);

  const initHomepage = async () => {
    await loadChatFromServer();
  }

  const loadChatFromServer = async () => {
    try {
      setShowChat(false);
      const response = await apiClient.get<{ chatid: string; messages: { questionid: string; content: string; role: string; }[] }>(`/chats/latest`);
      if (response.success) {
        const { chatid, messages } = response.data;
        setChatid(chatid);
        const formattedMessages = messages.map((msg) => ({
          id: msg.questionid,
          text: msg.content,
          sender: msg.role === "user" ? "user" : "bot",
          timestamp: Date.now(),
        } as Message));
        setMessages(formattedMessages);
        setQuestionid(messages[messages.length - 1].questionid);
        setShowChat(true);
      } else {
        console.log("No previous chat found, starting fresh.");
        setShowChat(true)
        setChatid(null);
        setQuestionid(guid());
        setMessages([]);
      }
    } catch (err) {
      console.error("Error loading chat from server:", err);
    }
  }

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: questionid,
      text: inputValue,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Transition to chat view on first message
    if (!showChat) {
      setShowChat(true);
    }

    const submitReq: MessageSubmitReq = {
      initialquestion: chatid ? null : initialquestion,
      answertext: userMessage.text,
      questionid: userMessage.id
    }

    try {
      let ep = "/chats/submit"
      if (chatid) {
        ep += "?chatid=" + chatid
      }
      const message = await apiClient.post<{ chatid: string; question: string, questionid: string, done: boolean }>(ep, submitReq);
      console.log(message);
      const botMessage: Message = {
        id: message.data.questionid,
        text: message.data.question,
        sender: "bot",
        timestamp: Date.now(),
      };
      setChatid(message.data.chatid);
      setQuestionid(message.data.questionid)
      setMessages((prev) => [...prev, botMessage]);
      if (message.data.done) {
        setIsChatDone(true);
      }
    } catch (err: any) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: err.message,
        sender: "bot",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false)
    }
  };

  const handleChatReset = async () => {
    setIsTyping(true);
    try {
      const response = await apiClient.post(`/chats/end-chat?chatid=${chatid}`, {});
      if (response.success) {
        router.push("/chat/history");
      }
    } catch (err) {
      console.error("Error resetting chat:", err);
    } finally {
      setIsTyping(false);
    }
  }

  const handleHistoryNavigate = () => {
    router.push("/chat/history");
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="max-w-7xl w-full px-4 mx-auto flex flex-col flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!showChat ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-2 flex-1"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl text-center font-semibold tracking-tighter text-black"
              >
                Your <span className="text-[#980194]">Mental Wellbeing</span>
                <br />
                Starts Here.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg text-gray-400"
              >
                Smart questions. Meaningful support
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1 overflow-hidden max-w-4xl w-full mx-auto py-4"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 px-4 scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      {message.sender === "user" ? (
                        <UserMessage text={message.text} />
                      ) : (
                        <BotMessage text={message.text} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Image
                          src="/images/logo3.png"
                          alt="Bot"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-1 pt-2">
                        <motion.span
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.span
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.15,
                            ease: "easeInOut",
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.span
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.3,
                            ease: "easeInOut",
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: showChat ? 0 : 0.6, duration: 0.5 }}
          onSubmit={handleSendMessage}
          onReset={handleChatReset}
          className="w-full max-w-4xl mx-auto py-4 flex gap-2"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isChatDone ? "✓ Session complete — thank you for sharing." : initialquestion}
            className={`bg-white border-gray-200 focus-visible:ring-purple-400 h-12 flex-1 transition-all duration-300 ${isChatDone ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" : ""
              }`}
            required
            disabled={isChatDone}
          />
          <Button
            type="submit"
            className={`aspect-square h-12 px-6 transition-all duration-300 ${isChatDone
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : "bg-[#980194] hover:bg-[#7a0177]"
              }`}
            disabled={isTyping || !inputValue.trim() || isChatDone}
          >
            <Send className={`w-4 h-4 ${isChatDone ? "text-gray-400" : "text-white"}`} />
          </Button>
          <Button
            type="reset"
            className={`aspect-square h-12 px-6 transition-all duration-300 ${isChatDone
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : "bg-[#980194] hover:bg-[#7a0177]"
              }`}
            disabled={isTyping || isChatDone}
          >
            <RefreshCw className={`w-4 h-4 ${isChatDone ? "text-gray-400" : "text-white"}`} />
          </Button>
          <Button
            type="button"
            onClick={handleHistoryNavigate}
            className={`aspect-square h-12 px-6 transition-all duration-300 ${isChatDone
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : "bg-[#980194] hover:bg-[#7a0177]"
              }`}
            disabled={isTyping || isChatDone}
          >
            <HistoryIcon className={`w-4 h-4 ${isChatDone ? "text-gray-400" : "text-white"}`} />
          </Button>
        </motion.form>
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: number;
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

// Mock responses for mental wellbeing chatbot
const mockResponses = [
  "I'm here to listen. Can you tell me more about what's on your mind?",
  "That sounds like it's been challenging for you. How long have you been feeling this way?",
  "It's completely normal to feel that way. What usually helps you when you're going through something like this?",
  "Thank you for sharing that with me. Your feelings are valid and important.",
  "Have you been able to talk to anyone else about this? Sometimes connecting with others can help.",
  "Self-care is so important. What are some things that usually bring you comfort or joy?",
  "I hear you. Taking things one step at a time can really help. What's one small thing you could do today for yourself?",
  "It takes courage to open up about these feelings. I'm glad you're here.",
  "Remember, it's okay to not be okay sometimes. What kind of support are you looking for right now?",
  "That's a really insightful observation. How does recognizing that make you feel?",
];

const getRandomResponse = (): string => {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      setMessages(parsedMessages);
      setShowChat(parsedMessages.length > 0);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
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

    // Simulate bot typing and response
    setTimeout(
      () => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getRandomResponse(),
          sender: "bot",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000,
    ); // Random delay between 1-2 seconds
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
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
          className="w-full max-w-4xl mx-auto py-4 flex gap-2"
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share what's on your mind..."
            className="bg-white border-gray-200 focus-visible:ring-purple-400 h-12 flex-1"
            required
          />
          <Button
            type="submit"
            className="bg-[#980194] aspect-square hover:bg-[#7a0177] h-12 px-6"
            disabled={isTyping || !inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.form>
      </div>
    </div>
  );
}

import { MessageCircle, User, Bot } from "lucide-react";

interface Props {
  date: string;
  messages: { id: string; sender: string; text: string }[];
}

export function PatientChatHistory({ date, messages }: Props) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm p-6 flex flex-col h-130">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Chat History</h3>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <MessageCircle className="h-5 w-5 text-[#980194]" />
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <MessageCircle className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-500">No chat messages for this session.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
          {messages.map((msg) =>
            msg.sender === "patient" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="flex items-end gap-2 max-w-[75%]">
                  <div className="bg-[#980194]/10 text-gray-700 text-sm rounded-2xl rounded-br-sm px-4 py-2.5 leading-relaxed border border-[#980194]/15">
                    {msg.text}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#f5e8f5] border border-[#980194]/20 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-[#980194]" />
                  </div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-end gap-2 max-w-[75%]">
                <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="bg-gray-50 text-gray-700 text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 leading-relaxed border border-gray-200">
                  {msg.text}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

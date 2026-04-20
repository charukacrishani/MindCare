interface Props {
  date: string;
  messages: { id: string; sender: string; text: string; }[];
}

export function PatientChatHistory({ date, messages }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          Patient's Chat History
        </h3>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
        {messages.map((msg) =>
          msg.sender === "patient" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="flex items-start gap-2 max-w-[75%]">
                <div className="bg-rose-50 text-gray-700 text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 leading-relaxed">
                  {msg.text}
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-rose-600 text-xs">✕</span>
                </div>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start gap-2 max-w-[75%]">
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs">🙂</span>
              </div>
              <div className="bg-gray-50 text-gray-700 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 leading-relaxed">
                {msg.text}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

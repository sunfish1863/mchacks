import { Bot, User } from "lucide-react";

export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className={`text-xs text-gray-500 mt-1 px-2 ${isUser ? "text-right" : ""}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-700" />
        </div>
      )}
    </div>
  );
}

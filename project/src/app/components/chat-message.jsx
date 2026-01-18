import { useState } from "react";
import { Bot, User } from "lucide-react";

export function ChatMessage({ message, favicon }) {
  const [faviconError, setFaviconError] = useState(false);
  const isUser = message.role === "user";
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"} mb-4 sm:mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
          {favicon && !faviconError ? (
            <img 
              src={favicon} 
              alt="Website favicon" 
              className="w-full h-full object-cover"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          )}
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className={`text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 px-2 ${isUser ? "text-right" : ""}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </div>
      )}
    </div>
  );
}

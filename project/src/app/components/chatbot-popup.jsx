// project/src/app/components/chatbot-popup.jsx
import { useEffect, useRef, useState } from "react";
import { X, Minimize2, Maximize2, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { WebsiteAnalysis } from "./website-analysis";

// Mock website data generator
const getMockWebsiteData = (url) => {
  const domain = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

  const mockData = {
    "amazon.com": {
      url,
      title: "Amazon – Online Shopping",
      summary:
        "Amazon is a global e-commerce platform offering millions of products across various categories. Shop for electronics, books, clothing, and more with fast delivery options.",
      sections: [
        { name: "Shop by Department", description: "Browse all product categories", icon: "shop" },
        { name: "Today's Deals", description: "View current discounts and offers", icon: "shop" },
        { name: "Your Account", description: "Manage orders and settings", icon: "info" },
        { name: "Customer Service", description: "Get help with your orders", icon: "contact" },
      ],
    },
    "github.com": {
      url,
      title: "GitHub – Developer Platform",
      summary:
        "GitHub is a platform for version control and collaboration. Developers use it to build, ship, and maintain software projects together.",
      sections: [
        { name: "Explore Repositories", description: "Discover trending projects", icon: "navigation" },
        { name: "Your Profile", description: "View your contributions", icon: "info" },
        { name: "Create Repository", description: "Start a new project", icon: "shop" },
        { name: "Documentation", description: "Learn about features", icon: "info" },
      ],
    },
    default: {
      url,
      title: domain.charAt(0).toUpperCase() + domain.slice(1),
      summary: `${domain} is a website offering services and information. I can help you navigate it more easily.`,
      sections: [
        { name: "Home", description: "Return to homepage", icon: "navigation" },
        { name: "Products/Services", description: "View main offerings", icon: "shop" },
        { name: "About", description: "Learn more about the company", icon: "info" },
        { name: "Contact", description: "Get in touch", icon: "contact" },
      ],
    },
  };

  for (const key in mockData) {
    if (domain.includes(key)) return mockData[key];
  }
  return mockData.default;
};

export function ChatbotPopup({ isOpen, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! 👋 I'm your website navigation assistant. Paste any website URL and I’ll help you understand and navigate it.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentWebsite]);

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    const urls = text.match(urlRegex);

    setTimeout(() => {
      if (urls && urls.length > 0) {
        let url = urls[0];
        if (!url.startsWith("http")) url = "https://" + url;

        const websiteData = getMockWebsiteData(url);
        setCurrentWebsite(websiteData);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Great! I've analyzed ${websiteData.title}. Here's what I found:`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        const responses = [
          "I’m here to help you navigate websites. Paste a URL and I’ll break it down.",
          "Drop a website URL (like amazon.com) and tell me what you’re trying to do.",
          "Paste a URL and I’ll point you to the right section + next steps.",
        ];
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }, 450);
  };

  const handleNavigate = (section) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Want to go to "${section}"? Tell me what you’re trying to accomplish there and I’ll guide you step-by-step.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999999]">
      <div
        className={[
          "bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden",
          "transition-all duration-300",
          isMinimized ? "w-[360px] h-16" : "w-[420px] h-[640px]",
        ].join(" ")}
      >
        {/* Header (matches your screenshot) */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg leading-none">AI Navigation Assistant</div>
              <div className="text-blue-100 text-xs mt-1">Online</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized((v) => !v)}
              className="h-9 w-9 rounded-lg text-white hover:bg-white/20 grid place-items-center"
              aria-label="Minimize"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-lg text-white hover:bg-white/20 grid place-items-center"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[500px] p-4 overflow-y-auto bg-white">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}

              {currentWebsite && (
                <WebsiteAnalysis data={currentWebsite} onNavigate={handleNavigate} />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Paste a website URL or ask a question..."
                  className="flex-1 h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 grid place-items-center text-white shadow-sm"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

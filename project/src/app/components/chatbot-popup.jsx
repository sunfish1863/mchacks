import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { WebsiteAnalysis } from "./website-analysis";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

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
      id: '1',
      role: 'assistant',
      content: 'Hi! 👋 I\'m your website navigation assistant. Paste any website URL and I\'ll help you understand and navigate it.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Check if the message contains a URL
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    const urls = inputValue.match(urlRegex);

    setTimeout(() => {
      if (urls && urls.length > 0) {
        let url = urls[0];
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }

        const websiteData = getMockWebsiteData(url);
        setCurrentWebsite(websiteData);

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Great! I've analyzed ${websiteData.title}. Here's what I found:`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // General response for non-URL messages
        const responses = [
          "I'm here to help you navigate websites! Just paste a URL and I'll break it down for you.",
          "Feel free to ask me anything about website navigation, or share a URL to get started!",
          "I can help you understand any website better. Try pasting a URL like amazon.com or github.com!"
        ];
        
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    }, 500);
  };

  const handleNavigate = (section) => {
    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I can help you navigate to "${section}". This section typically contains ${section.toLowerCase()} related information and features. Would you like more specific guidance about what you can find there?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Navigation Assistant</h3>
              <p className="text-xs text-blue-100">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="h-[440px] p-4">
              <div>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {currentWebsite && (
                  <WebsiteAnalysis
                    data={currentWebsite}
                    onNavigate={handleNavigate}
                  />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste a website URL or ask a question..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { WebsiteAnalysis } from "./website-analysis";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

// Read website data from current page DOM
const getWebsiteDataFromDOM = () => {
  const url = window.location.href;
  const title = document.title || new URL(url).hostname;

  const headings = Array.from(document.querySelectorAll("h1, h2"))
    .slice(0, 8)
    .map((h) => h.innerText.trim())
    .filter(Boolean);

  const links = Array.from(document.querySelectorAll("a[href]"))
    .map((a) => {
      const text = (a.innerText || "").trim();
      const href = a.getAttribute("href");
      return { text, href };
    })
    .filter((l) => l.text.length >= 2)
    .slice(0, 8);

  return {
    url,
    title,
    summary:
      headings.length
        ? `This page has ${headings.length} main headings. Top topics: ${headings.slice(0, 3).join(" • ")}`
        : `I can help you navigate this page. I found ${links.length} useful links.`,
    sections: links.map((l) => ({
      name: l.text,
      description: l.href,
      icon: "navigation",
    })),
  };
};

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

// Get website favicon
const getWebsiteFavicon = () => {
  try {
    // Try multiple methods to get favicon
    const domain = window.location.origin;
    
    // Method 1: Check for link rel="icon" tags
    const linkTags = document.querySelectorAll('link[rel*="icon"]');
    if (linkTags.length > 0) {
      const href = linkTags[0].getAttribute('href');
      if (href) {
        return href.startsWith('http') ? href : new URL(href, domain).href;
      }
    }
    
    // Method 2: Try common favicon paths
    const commonPaths = ['/favicon.ico', '/favicon.png', '/apple-touch-icon.png'];
    for (const path of commonPaths) {
      const testUrl = new URL(path, domain).href;
      // We'll return it and let the browser handle 404s
      return testUrl;
    }
    
    // Method 3: Google favicon service as fallback
    const hostname = new URL(domain).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch (e) {
    // Fallback to Google favicon service
    const hostname = window.location.hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  }
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
  const [favicon, setFavicon] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 384, height: 600 }); // w-96 = 384px, h-[600px] = 600px
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const popupRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get favicon on mount
  useEffect(() => {
    const fav = getWebsiteFavicon();
    setFavicon(fav);
  }, []);

  // Auto-read current page once when injected (for extension)
  useEffect(() => {
    // Only auto-read if we're in a browser extension context and haven't read yet
    if (typeof chrome !== 'undefined' && chrome.runtime && !currentWebsite) {
      const data = getWebsiteDataFromDOM();
      setCurrentWebsite(data);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `You're on: ${data.title}. I pulled some navigation items from this page.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Resize handlers
  useEffect(() => {
    if (!isResizing || !popupRef.current) return;

    const startRect = popupRef.current.getBoundingClientRect();
    const startDimensions = dimensions;
    const startX = window.innerWidth - startRect.right;
    const startY = window.innerHeight - startRect.bottom;

    const handleMouseMove = (e) => {
      const minWidth = 320;
      const minHeight = 400;
      const maxWidth = window.innerWidth - 48;
      const maxHeight = window.innerHeight - 48;

      let newWidth = startDimensions.width;
      let newHeight = startDimensions.height;

      if (resizeDirection.includes('right') || resizeDirection === 'bottom-right') {
        const rightEdge = window.innerWidth - e.clientX;
        newWidth = Math.min(maxWidth, Math.max(minWidth, window.innerWidth - rightEdge - startX));
      }
      
      if (resizeDirection.includes('bottom') || resizeDirection === 'bottom-right') {
        const bottomEdge = window.innerHeight - e.clientY;
        newHeight = Math.min(maxHeight, Math.max(minHeight, window.innerHeight - bottomEdge - startY));
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection]);

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

  const handleResizeStart = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  return (
    <div 
      ref={popupRef}
      className="fixed bottom-6 right-6 z-50"
      style={{
        width: isMinimized ? '320px' : `${dimensions.width}px`,
        height: isMinimized ? '64px' : `${dimensions.height}px`,
        transition: isResizing ? 'none' : 'width 0.2s, height 0.2s',
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 relative h-full w-full flex flex-col ${
          isMinimized ? '' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base sm:text-lg">AI Navigation Assistant</h3>
              <p className="text-xs sm:text-sm text-blue-100">Online</p>
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

        {/* Resize handles */}
        {!isMinimized && (
          <>
            {/* Right edge */}
            <div
              onMouseDown={handleResizeStart('right')}
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-200/30 transition-colors rounded-r-2xl"
              style={{ zIndex: 10 }}
            />
            {/* Bottom edge */}
            <div
              onMouseDown={handleResizeStart('bottom')}
              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200/30 transition-colors rounded-b-2xl"
              style={{ zIndex: 10 }}
            />
            {/* Bottom-right corner */}
            <div
              onMouseDown={handleResizeStart('bottom-right')}
              className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-blue-200/30 transition-colors rounded-br-2xl"
              style={{ zIndex: 10 }}
            />
          </>
        )}

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 sm:p-6" style={{ maxHeight: 'calc(100% - 120px)' }}>
              <div>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} favicon={favicon} />
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
            <div className="p-4 sm:p-5 border-t border-gray-200">
              <div className="flex gap-2 sm:gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste a website URL or ask a question..."
                  className="flex-1 text-sm sm:text-base"
                  style={{ backgroundColor: '#C9C9C9' }}
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

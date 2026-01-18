import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

// Minimal page context (no headings/links)
const getPageContext = () => {
  const url = window.location.href;
  const hostname = window.location.hostname || "";
  const title = document.title || hostname;
  return { url, hostname, title };
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
      content: "Hi 👋 Ask me anything about the page you’re on.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [pageContext, setPageContext] = useState(null);
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

  // Capture which site we're on (extension injection context or normal web context)
  useEffect(() => {
    const ctx = getPageContext();
    setPageContext(ctx);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: ctx.hostname
          ? `You’re on ${ctx.hostname}. Ask me anything about this page.`
          : `Ask me anything about this page.`,
        timestamp: new Date(),
      },
    ]);
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
    const text = inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Placeholder response (backend team will replace this)
    setTimeout(() => {
      const ctx = pageContext?.hostname ? ` on ${pageContext.hostname}` : "";
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Got it${ctx}. (Backend reply will go here.)`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    }, 300);
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
                  placeholder={
                    pageContext?.hostname
                      ? `Ask a question about ${pageContext.hostname}...`
                      : "Ask a question..."
                  }
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

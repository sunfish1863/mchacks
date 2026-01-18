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
  const [dimensions, setDimensions] = useState({ width: 384, height: 600 });
  const [offsets, setOffsets] = useState({ right: 24, bottom: 24 }); // matches bottom-6/right-6 (24px) // w-96 = 384px, h-[600px] = 600px
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

  // Resize handlers (all sides + corners)
useEffect(() => {
  if (!isResizing || !popupRef.current || !resizeDirection) return;

  const minWidth = 320;
  const minHeight = 400;

  // keep a little breathing room from the viewport edges
  const pad = 12;

  const startRect = popupRef.current.getBoundingClientRect();
  const startWidth = dimensions.width;
  const startHeight = dimensions.height;

  const startRight = offsets.right;
  const startBottom = offsets.bottom;

  // derive left/top from right/bottom anchoring
  const startLeft = window.innerWidth - startRight - startWidth;
  const startTop = window.innerHeight - startBottom - startHeight;

  const handleMouseMove = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newRight = startRight;
    let newBottom = startBottom;

    const maxWidth = window.innerWidth - pad * 2;
    const maxHeight = window.innerHeight - pad * 2;

    // LEFT: right stays fixed, left edge follows mouse
    if (resizeDirection.includes("left")) {
      newWidth = (window.innerWidth - startRight) - mouseX;
    }

    // RIGHT: left stays fixed, right edge follows mouse
    if (resizeDirection.includes("right")) {
      newRight = window.innerWidth - mouseX;
      newWidth = window.innerWidth - newRight - startLeft;
    }

    // TOP: bottom stays fixed, top edge follows mouse
    if (resizeDirection.includes("top")) {
      newHeight = (window.innerHeight - startBottom) - mouseY;
    }

    // BOTTOM: top stays fixed, bottom edge follows mouse
    if (resizeDirection.includes("bottom")) {
      newBottom = window.innerHeight - mouseY;
      newHeight = window.innerHeight - newBottom - startTop;
    }

    // clamp sizes
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    // clamp offsets so window doesn't drift offscreen
    newRight = Math.max(pad, Math.min(window.innerWidth - pad - newWidth, newRight));
    newBottom = Math.max(pad, Math.min(window.innerHeight - pad - newHeight, newBottom));

    setDimensions({ width: newWidth, height: newHeight });
    setOffsets({ right: newRight, bottom: newBottom });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}, [isResizing, resizeDirection, dimensions, offsets]);


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
      className="fixed z-50"
style={{
  right: `${offsets.right}px`,
  bottom: `${offsets.bottom}px`,
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
              <h3 className="font-semibold text-white text-base sm:text-lg">Browsy</h3>
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
        {/* Resize handles */}
{!isMinimized && (
  <>
    {/* Edges */}
    <div
      onMouseDown={handleResizeStart("left")}
      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-200/30 transition-colors rounded-l-2xl"
      style={{ zIndex: 10 }}
    />
    <div
      onMouseDown={handleResizeStart("right")}
      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-200/30 transition-colors rounded-r-2xl"
      style={{ zIndex: 10 }}
    />
    <div
      onMouseDown={handleResizeStart("top")}
      className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200/30 transition-colors rounded-t-2xl"
      style={{ zIndex: 10 }}
    />
    <div
      onMouseDown={handleResizeStart("bottom")}
      className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-200/30 transition-colors rounded-b-2xl"
      style={{ zIndex: 10 }}
    />

    {/* Corners */}
    <div
      onMouseDown={handleResizeStart("top-left")}
      className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize hover:bg-blue-200/30 transition-colors rounded-tl-2xl"
      style={{ zIndex: 11 }}
    />
    <div
      onMouseDown={handleResizeStart("top-right")}
      className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize hover:bg-blue-200/30 transition-colors rounded-tr-2xl"
      style={{ zIndex: 11 }}
    />
    <div
      onMouseDown={handleResizeStart("bottom-left")}
      className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize hover:bg-blue-200/30 transition-colors rounded-bl-2xl"
      style={{ zIndex: 11 }}
    />
    <div
      onMouseDown={handleResizeStart("bottom-right")}
      className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-blue-200/30 transition-colors rounded-br-2xl"
      style={{ zIndex: 11 }}
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

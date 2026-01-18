// project/src/App.jsx
import { useState } from "react";
import { ChatbotPopup } from "./app/components/chatbot-popup";

export default function App() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Chatbot popup */}
      <ChatbotPopup isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Re-open button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 999,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            zIndex: 999999,
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}

import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("https://www.youtube.com/embed/d-WlaSwe-Kg");
  const [input, setInput] = useState(url);

  function go(e) {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setUrl(normalized);
  }

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Full-screen "browser" layer */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1 }}>
        {/* Simple address bar */}
        <form
          onSubmit={go}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 3,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL (e.g. example.com)"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go
          </button>
        </form>

        <iframe
          title="Full Screen Site"
          src={url}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>

      {/* Chatbot iframe on top */}
      <iframe
        title="Chatbot"
        src="/embed"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 360,
          height: 520,
          border: "none",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          zIndex: 999999, // higher than full-screen iframe
          background: "transparent",
        }}
      />
    </div>
  );
}

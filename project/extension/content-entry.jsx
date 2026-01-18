import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ChatbotPopup } from "../src/app/components/chatbot-popup";

const HOST_ID = "ai-nav-assistant-root";

(async function mount() {
  // avoid double-inject
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.right = "0";
  host.style.bottom = "0";
  document.documentElement.appendChild(host);

  // Shadow DOM to isolate Tailwind from website CSS
  const shadow = host.attachShadow({ mode: "open" });

  // Load compiled CSS
  const cssUrl = chrome.runtime.getURL("content.css");
  const cssText = await fetch(cssUrl).then((r) => r.text());

  const style = document.createElement("style");
  style.textContent = cssText;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  function App() {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
      setOpen(false);
      // remove host so it fully disappears
      setTimeout(() => {
        try {
          host.remove();
        } catch (e) {}
      }, 0);
    };

    return <ChatbotPopup isOpen={open} onClose={handleClose} />;
  }

  ReactDOM.createRoot(mountPoint).render(<App />);
})();

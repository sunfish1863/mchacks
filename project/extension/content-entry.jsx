import React from "react";
import ReactDOM from "react-dom/client";
import { ChatbotPopup } from "../src/app/components/chatbot-popup";

const HOST_ID = "ai-nav-assistant-root";

(async function mount() {
  // avoid double-inject
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.all = "initial"; // helps avoid some page CSS weirdness
  host.style.position = "fixed";
  host.style.zIndex = "2147483647"; // on top of everything
  host.style.right = "0";
  host.style.bottom = "0";
  document.documentElement.appendChild(host);

  // Shadow DOM to isolate Tailwind from website CSS
  const shadow = host.attachShadow({ mode: "open" });

  // Load compiled CSS (we'll generate content.css in step 5)
  const cssUrl = chrome.runtime.getURL("content.css");
  const cssText = await fetch(cssUrl).then((r) => r.text());

  const style = document.createElement("style");
  style.textContent = cssText;
  shadow.appendChild(style);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  ReactDOM.createRoot(mountPoint).render(<ChatbotPopup isOpen={true} onClose={() => {}} />);
})();

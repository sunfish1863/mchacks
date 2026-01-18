const HOST_ID = "ai-nav-assistant-root";

console.log("Background service worker loaded");

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  const [{ result: alreadyThere } = {}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (hostId) => !!document.getElementById(hostId),
    args: [HOST_ID],
  });

  if (!alreadyThere) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-entry.js"],
    });
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (hostId) => {
        const el = document.getElementById(hostId);
        if (!el) return;
        const isHidden = el.getAttribute("data-hidden") === "1";
        el.setAttribute("data-hidden", isHidden ? "0" : "1");
        el.style.display = isHidden ? "block" : "none";
      },
      args: [HOST_ID],
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received:", message);

  // START RUN (POST)
  if (message.type === "GUMLOOP_START") {
    fetch("http://localhost:8000/api/gumloop/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Gumloop start response:", data);
        sendResponse({ ok: true, data });
      })
      .catch((err) => {
        console.error("Gumloop start failed:", err);
        sendResponse({ ok: false, error: err.message });
      });

    return true; // KEEP SERVICE WORKER ALIVE
  }

  // POLL STATUS (GET)
  if (message.type === "GUMLOOP_STATUS") {
    fetch(`http://localhost:8000/api/gumloop/status/${message.runId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        sendResponse({ ok: true, data });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message });
      });

    return true;
  }

  return false;
});

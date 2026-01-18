const HOST_ID = "ai-nav-assistant-root";

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // 1) Check if already injected
  const [{ result: alreadyThere } = {}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (hostId) => !!document.getElementById(hostId),
    args: [HOST_ID],
  });

  if (!alreadyThere) {
    // 2) Inject the UI bundle (React content script)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-entry.js"],
    });
  } else {
    // 3) Toggle visibility
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

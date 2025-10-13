chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveTab") {
    const { url, category, description, timestamp, isFavorite } =
      message.payload;

    chrome.storage.local.get(["myLeads"], (result) => {
      const myLeads = result.myLeads || [];

      if (!myLeads.some((lead) => lead.url === url)) {
        myLeads.push({ url, category, description, timestamp, isFavorite });

        chrome.storage.local.set({ myLeads }, () => {
          console.log("Tab saved:", url);

          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, message: "Tab already saved" });
      }
    });

    return true; // Keeps the message channel open for async response
  }
});

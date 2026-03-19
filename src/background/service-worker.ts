// Relay messages from content script to popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "LINKEDIN_PROFILE_DATA" || message.type === "LINKEDIN_NO_PROFILE") {
    chrome.storage.session.set({ linkedinProfile: message });
    sendResponse({ ok: true });
  }
  return false;
});

// When a tab is updated, request fresh profile data from content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("linkedin.com")
  ) {
    chrome.tabs.sendMessage(tabId, { type: "REQUEST_PROFILE_DATA" }).catch(() => {});
  }
});

// When the active tab changes, request profile data
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url?.includes("linkedin.com")) {
      chrome.tabs.sendMessage(activeInfo.tabId, { type: "REQUEST_PROFILE_DATA" }).catch(() => {});
    } else {
      chrome.storage.session.set({
        linkedinProfile: { type: "LINKEDIN_NO_PROFILE" },
      });
    }
  } catch {
    // Tab may not exist
  }
});

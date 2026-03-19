import type { LinkedInProfileData } from "../api/types";

function isProfilePage(): boolean {
  return /linkedin\.com\/in\/[^/]+/.test(window.location.href);
}

function extractProfileUrl(): string {
  const match = window.location.href.match(
    /(https?:\/\/www\.linkedin\.com\/in\/[^/?#]+)/
  );
  return match ? match[1] : window.location.href;
}

function extractProfileData(): LinkedInProfileData | null {
  if (!isProfilePage()) return null;

  const nameEl = document.querySelector("h1");
  const fullName = nameEl?.textContent?.trim() ?? "";

  const parts = fullName.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  const headlineEl = document.querySelector(
    ".text-body-medium.break-words"
  );
  const headline = headlineEl?.textContent?.trim() ?? "";

  const locationEl = document.querySelector(
    ".text-body-small.inline.t-black--light.break-words"
  );
  const location = locationEl?.textContent?.trim() ?? "";

  return {
    fullName,
    firstName,
    lastName,
    profileUrl: extractProfileUrl(),
    headline,
    location,
  };
}

function sendProfileData() {
  const data = extractProfileData();
  if (data) {
    chrome.runtime.sendMessage({
      type: "LINKEDIN_PROFILE_DATA",
      data,
    });
  } else {
    chrome.runtime.sendMessage({ type: "LINKEDIN_NO_PROFILE" });
  }
}

// Listen for requests from background/side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "REQUEST_PROFILE_DATA") {
    sendProfileData();
    sendResponse({ ok: true });
  }
  return false;
});

// Initial extraction
sendProfileData();

// Watch for SPA navigation (LinkedIn is a SPA)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    // Small delay to let the page render
    setTimeout(sendProfileData, 1000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

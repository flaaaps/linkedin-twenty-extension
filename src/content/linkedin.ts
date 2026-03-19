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

function getMetaContent(name: string): string {
  const el =
    document.querySelector(`meta[property="${name}"]`) ??
    document.querySelector(`meta[name="${name}"]`);
  return el?.getAttribute("content")?.trim() ?? "";
}

function extractProfileData(): LinkedInProfileData | null {
  if (!isProfilePage()) return null;
  const profileUrl = extractProfileUrl();

  // Name: extract from page title (most reliable — "René Klein | LinkedIn")
  let fullName = "";
  const title = document.title || "";
  const titleMatch = title.match(/^(.+?)[\s]*[|–-][\s]*LinkedIn/i);
  if (titleMatch) fullName = titleMatch[1].trim();

  // Fallback: og:title
  if (!fullName) {
    fullName = getMetaContent("og:title").replace(/[\s]*[|–-][\s]*LinkedIn.*$/i, "").trim();
  }

  const parts = fullName.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  let headline = "";
  let company = "";
  let location = "";

  // Find the profile section by locating the <a> that links to this profile
  const slug = extractProfileUrl().replace(/^https?:\/\/www\.linkedin\.com/, "");
  const profileLinks = document.querySelectorAll(`a[href*="${slug}"]`);

  // The profile name link contains an h1 or h2 — find that specific <a>
  let nameLink: Element | null = null;
  for (const link of profileLinks) {
    if (link.querySelector("h1, h2")) {
      nameLink = link;
      break;
    }
  }

  // Walk up from the name link to find the profile section container
  // Structure: a → div[data-display-contents] → div (name row) → div (profile section)
  if (nameLink) {
    let container = nameLink.parentElement;
    for (let i = 0; i < 6 && container; i++) {
      const directPs = Array.from(container.children).filter(
        (el): el is HTMLParagraphElement =>
          el.tagName === "P" &&
          !!el.textContent?.trim() &&
          !el.textContent.trim().startsWith("·")
      );
      if (directPs.length >= 2) {
        headline = directPs[0]?.textContent?.trim() ?? "";
        const companyRaw = directPs[1]?.textContent?.trim() ?? "";
        company = companyRaw.split("·")[0]?.trim() ?? "";

        // Location is in a child <div> containing <p> elements
        const divChildren = Array.from(container.children).filter(
          (el) => el.tagName === "DIV"
        );
        // The location div is after the name row div — find one with a <p> containing a comma (city, region)
        for (const div of divChildren) {
          const firstP = div.querySelector("p");
          const text = firstP?.textContent?.trim() ?? "";
          if (text && text.includes(",")) {
            location = text;
            break;
          }
        }
        break;
      }
      container = container.parentElement;
    }
  }

  // Fallback for headline: og:description
  if (!headline) {
    const desc = getMetaContent("og:description");
    const m = desc.match(/^(.+?)(?:\s*·|\s*-\s*LinkedIn)/);
    if (m) headline = m[1].trim();
  }

  return { fullName, firstName, lastName, profileUrl, headline, company, location };
}

function sendProfileData() {
  const data = extractProfileData();
  if (data) {
    chrome.runtime.sendMessage({ type: "LINKEDIN_PROFILE_DATA", data });
  } else {
    chrome.runtime.sendMessage({ type: "LINKEDIN_NO_PROFILE" });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "REQUEST_PROFILE_DATA") {
    sendProfileData();
    sendResponse({ ok: true });
  }
  return false;
});

setTimeout(sendProfileData, 1500);

let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    setTimeout(sendProfileData, 2000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

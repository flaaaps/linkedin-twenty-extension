import { useState, useEffect } from "react";
import type { LinkedInProfileData, MessageType } from "../../api/types";

export function useLinkedInProfile() {
  const [profile, setProfile] = useState<LinkedInProfileData | null>(null);

  useEffect(() => {
    // Poll storage for latest profile data from content script
    const loadProfile = async () => {
      const result = await chrome.storage.session.get("linkedinProfile");
      const msg = result.linkedinProfile as MessageType | undefined;
      if (msg?.type === "LINKEDIN_PROFILE_DATA") {
        setProfile(msg.data);
      } else {
        setProfile(null);
      }
    };

    loadProfile();

    // Listen for storage changes
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === "session" && changes.linkedinProfile) {
        const msg = changes.linkedinProfile.newValue as MessageType | undefined;
        if (msg?.type === "LINKEDIN_PROFILE_DATA") {
          setProfile(msg.data);
        } else {
          setProfile(null);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Request fresh data from active tab
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id && tabs[0].url?.includes("linkedin.com")) {
        chrome.tabs
          .sendMessage(tabs[0].id, { type: "REQUEST_PROFILE_DATA" })
          .catch(() => {});
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return profile;
}

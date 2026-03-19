import type { ExtensionSettings } from "../api/types";

const SETTINGS_KEY = "linkedin_twenty_settings";
const FIELD_MAP_KEY = "linkedin_twenty_field_map";

export async function getSettings(): Promise<ExtensionSettings | null> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return result[SETTINGS_KEY] ?? null;
}

export async function saveSettings(
  settings: Omit<ExtensionSettings, "customFieldMap">
): Promise<void> {
  const existing = await getSettings();
  await chrome.storage.local.set({
    [SETTINGS_KEY]: { ...existing, ...settings },
  });
}

export async function getCustomFieldMap(): Promise<Record<string, string>> {
  const result = await chrome.storage.local.get(FIELD_MAP_KEY);
  return result[FIELD_MAP_KEY] ?? {};
}

export async function saveCustomFieldMap(
  map: Record<string, string>
): Promise<void> {
  await chrome.storage.local.set({ [FIELD_MAP_KEY]: map });
}

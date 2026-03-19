import { useState, useEffect, useCallback } from "react";
import { TwentyClient } from "../../api/twenty-client";
import { getSettings, getCustomFieldMap, saveCustomFieldMap } from "../../utils/storage";
import type { MetadataField } from "../../api/types";

const KNOWN_CUSTOM_LABELS: Record<string, string> = {
  Anrede: "anrede",
  Begegnungen: "begegnungen",
  "Primäres Kommunikationsmedium": "primeresKommunikationsmedium",
  Reminder: "reminder",
};

export function useTwentyApi() {
  const [client, setClient] = useState<TwentyClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [customFieldMap, setCustomFieldMap] = useState<Record<string, string>>({});

  const initClient = useCallback(async () => {
    const settings = await getSettings();
    if (settings?.crmUrl && settings?.apiKey) {
      const c = new TwentyClient(settings.crmUrl, settings.apiKey);
      setClient(c);

      // Load cached custom field map
      const cached = await getCustomFieldMap();
      if (Object.keys(cached).length > 0) {
        setCustomFieldMap(cached);
      } else {
        // Discover fields from metadata
        try {
          const fields = await c.getMetadataFields();
          const map = resolveCustomFields(fields);
          setCustomFieldMap(map);
          await saveCustomFieldMap(map);
        } catch {
          // Fall back to hardcoded guesses
          setCustomFieldMap(KNOWN_CUSTOM_LABELS);
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initClient();
  }, [initClient]);

  const refresh = useCallback(() => {
    setLoading(true);
    initClient();
  }, [initClient]);

  return { client, loading, customFieldMap, refresh };
}

function resolveCustomFields(
  fields: MetadataField[]
): Record<string, string> {
  const personFields = fields.filter((f) =>
    // Only include fields on the person object
    f.type !== "RELATION"
  );

  const map: Record<string, string> = {};
  for (const [label, fallback] of Object.entries(KNOWN_CUSTOM_LABELS)) {
    const found = personFields.find(
      (f) =>
        f.label.toLowerCase() === label.toLowerCase() ||
        f.name.toLowerCase() === fallback.toLowerCase()
    );
    map[label] = found?.name ?? fallback;
  }
  return map;
}

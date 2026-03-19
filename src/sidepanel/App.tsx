import { useState, useEffect, useCallback, useRef } from "react";
import { useTwentyApi } from "./hooks/useTwentyApi";
import { useLinkedInProfile } from "./hooks/useLinkedInProfile";
import { getSettings } from "../utils/storage";
import { SettingsView } from "./components/SettingsView";
import { PersonSearch, initialSearchState } from "./components/PersonSearch";
import type { SearchState } from "./components/PersonSearch";
import { PersonForm } from "./components/PersonForm";
import { PersonDetail } from "./components/PersonDetail";
import type { Person } from "../api/types";

type View =
  | { name: "main" }
  | { name: "create" }
  | { name: "edit"; person: Person }
  | { name: "detail"; person: Person }
  | { name: "settings" };

export default function App() {
  const { client, loading, customFieldMap, refresh } = useTwentyApi();
  const linkedInProfile = useLinkedInProfile();
  const [view, setView] = useState<View>({ name: "main" });
  const [hasSettings, setHasSettings] = useState<boolean | null>(null);

  // LinkedIn auto-lookup state
  const [linkedInMatch, setLinkedInMatch] = useState<Person | null>(null);
  const [linkedInStatus, setLinkedInStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const lastSearchedUrl = useRef<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);

  useEffect(() => {
    getSettings().then((s) => {
      setHasSettings(!!(s?.crmUrl && s?.apiKey));
    });
  }, []);

  // Auto-lookup LinkedIn profile
  useEffect(() => {
    if (!client || !linkedInProfile?.profileUrl) {
      setLinkedInStatus("idle");
      setLinkedInMatch(null);
      lastSearchedUrl.current = null;
      return;
    }
    if (lastSearchedUrl.current === linkedInProfile.profileUrl) return;
    lastSearchedUrl.current = linkedInProfile.profileUrl;

    setLinkedInStatus("searching");
    client.findByLinkedIn(linkedInProfile.profileUrl).then((person) => {
      if (person) {
        setLinkedInMatch(person);
        setLinkedInStatus("found");
      } else {
        setLinkedInMatch(null);
        setLinkedInStatus("not_found");
      }
    }).catch(() => {
      setLinkedInMatch(null);
      setLinkedInStatus("not_found");
    });
  }, [client, linkedInProfile?.profileUrl]);

  const handleSettingsSaved = useCallback(() => {
    setHasSettings(true);
    refresh();
    setView({ name: "main" });
  }, [refresh]);

  if (loading || hasSettings === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasSettings || view.name === "settings") {
    return <SettingsView onSaved={handleSettingsSaved} />;
  }

  if (!client) {
    return (
      <div className="p-4 text-red-600">
        Failed to initialize API client. Check your settings.
        <button
          className="mt-2 text-blue-600 underline block"
          onClick={() => setView({ name: "settings" })}
        >
          Open Settings
        </button>
      </div>
    );
  }

  if (view.name === "create") {
    return (
      <PersonForm
        client={client}
        customFieldMap={customFieldMap}
        linkedInProfile={linkedInProfile}
        onSaved={(person) => {
          setLinkedInMatch(person);
          setLinkedInStatus("found");
          setView({ name: "main" });
        }}
        onCancel={() => setView({ name: "main" })}
      />
    );
  }

  if (view.name === "edit") {
    return (
      <PersonForm
        client={client}
        customFieldMap={customFieldMap}
        existingPerson={view.person}
        onSaved={(person) => {
          setLinkedInMatch(person);
          setLinkedInStatus("found");
          setView({ name: "main" });
        }}
        onCancel={() => setView({ name: "main" })}
      />
    );
  }

  if (view.name === "detail") {
    return (
      <PersonDetail
        client={client}
        person={view.person}
        onEdit={(person) => setView({ name: "edit", person })}
        onBack={() => setView({ name: "main" })}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h1 className="font-semibold text-base">Twenty CRM</h1>
        <button
          onClick={() => setView({ name: "settings" })}
          className="text-gray-500 hover:text-gray-700"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* LinkedIn profile section */}
        {linkedInProfile && (
          <div className="p-3 border-b bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{linkedInProfile.fullName}</p>
                {linkedInProfile.headline && (
                  <p className="text-xs text-gray-600 truncate">{linkedInProfile.headline}</p>
                )}
              </div>
              {linkedInStatus === "searching" && (
                <span className="text-xs text-gray-500 shrink-0">Searching...</span>
              )}
              {linkedInStatus === "not_found" && (
                <button
                  onClick={() => setView({ name: "create" })}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 shrink-0"
                >
                  Add to CRM
                </button>
              )}
              {linkedInStatus === "found" && (
                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded shrink-0">In CRM</span>
              )}
            </div>
          </div>
        )}

        {!linkedInProfile && (
          <div className="p-3 bg-gray-50 border-b text-gray-500 text-sm">
            Navigate to a LinkedIn profile to get started
          </div>
        )}

        {/* Inline person detail when found via LinkedIn */}
        {linkedInStatus === "found" && linkedInMatch && (
          <PersonDetail
            client={client}
            person={linkedInMatch}
            onEdit={(person) => setView({ name: "edit", person })}
            onBack={() => {
              setLinkedInMatch(null);
              setLinkedInStatus("idle");
              lastSearchedUrl.current = null;
            }}
            inline
          />
        )}

        {/* Search section */}
        <PersonSearch
          client={client}
          state={searchState}
          onStateChange={setSearchState}
          onSelect={(person) => setView({ name: "detail", person })}
        />
      </div>

      <div className="p-3 border-t">
        <button
          onClick={() => setView({ name: "create" })}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + New Person
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import type { LinkedInProfileData, Person } from "../../api/types";
import type { TwentyClient } from "../../api/twenty-client";

interface Props {
  profile: LinkedInProfileData | null;
  client: TwentyClient;
  onPersonFound: (person: Person) => void;
  onCreateNew: () => void;
}

export function LinkedInStatus({ profile, client, onPersonFound, onCreateNew }: Props) {
  const [status, setStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [foundPerson, setFoundPerson] = useState<Person | null>(null);

  const searchByLinkedIn = useCallback(async () => {
    if (!profile?.profileUrl) return;
    setStatus("searching");
    try {
      const person = await client.findByLinkedIn(profile.profileUrl);
      if (person) {
        setFoundPerson(person);
        setStatus("found");
      } else {
        setFoundPerson(null);
        setStatus("not_found");
      }
    } catch {
      setStatus("not_found");
    }
  }, [profile?.profileUrl, client]);

  useEffect(() => {
    if (profile?.profileUrl) {
      searchByLinkedIn();
    } else {
      setStatus("idle");
      setFoundPerson(null);
    }
  }, [profile?.profileUrl, searchByLinkedIn]);

  if (!profile) {
    return (
      <div className="p-3 bg-gray-50 border-b text-gray-500 text-sm">
        Navigate to a LinkedIn profile to get started
      </div>
    );
  }

  return (
    <div className="p-3 border-b bg-blue-50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{profile.fullName}</p>
          {profile.headline && (
            <p className="text-xs text-gray-600 truncate">{profile.headline}</p>
          )}
          {profile.location && (
            <p className="text-xs text-gray-500">{profile.location}</p>
          )}
        </div>
        <div className="shrink-0">
          {status === "searching" && (
            <span className="text-xs text-gray-500">Searching...</span>
          )}
          {status === "found" && foundPerson && (
            <button
              onClick={() => onPersonFound(foundPerson)}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              In CRM
            </button>
          )}
          {status === "not_found" && (
            <button
              onClick={onCreateNew}
              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
            >
              Add to CRM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

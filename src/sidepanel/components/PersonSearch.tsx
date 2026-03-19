import { useCallback } from "react";
import type { Person } from "../../api/types";
import type { TwentyClient } from "../../api/twenty-client";

export interface SearchState {
  query: string;
  results: Person[];
  searching: boolean;
  searched: boolean;
}

export const initialSearchState: SearchState = {
  query: "",
  results: [],
  searching: false,
  searched: false,
};

interface Props {
  client: TwentyClient;
  state: SearchState;
  onStateChange: (state: SearchState) => void;
  onSelect: (person: Person) => void;
}

export function PersonSearch({ client, state, onStateChange, onSelect }: Props) {
  const { query, results, searching, searched } = state;

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    onStateChange({ ...state, searching: true, searched: false });
    try {
      const people = await client.searchPeople(query.trim());
      onStateChange({ ...state, results: people, searching: false, searched: true });
    } catch {
      onStateChange({ ...state, results: [], searching: false, searched: true });
    }
  }, [query, client, state, onStateChange]);

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => onStateChange({ ...state, query: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search CRM by name..."
          className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-3 py-1.5 text-sm bg-gray-100 border rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((person) => (
            <li key={person.id}>
              <button
                onClick={() => onSelect(person)}
                className="w-full text-left p-2 rounded hover:bg-gray-50 border text-sm"
              >
                <span className="font-medium">
                  {person.name.firstName} {person.name.lastName}
                </span>
                {person.jobTitle && (
                  <span className="text-gray-500 ml-1">— {person.jobTitle}</span>
                )}
                {person.emails?.primaryEmail && (
                  <p className="text-xs text-gray-400 truncate">
                    {person.emails.primaryEmail}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No results found</p>
      )}
    </div>
  );
}

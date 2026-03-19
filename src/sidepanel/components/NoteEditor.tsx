import { useState } from "react";
import type { TwentyClient } from "../../api/twenty-client";

interface Props {
  client: TwentyClient;
  personId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function NoteEditor({ client, personId, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const note = await client.createNote(title.trim(), body.trim());
      await client.linkNoteToContact(note.id, personId);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
    setSaving(false);
  };

  return (
    <div className="border rounded-md p-3 bg-gray-50 space-y-2">
      {error && (
        <div className="bg-red-50 text-red-700 p-2 rounded text-xs">{error}</div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Note content..."
        rows={4}
        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}

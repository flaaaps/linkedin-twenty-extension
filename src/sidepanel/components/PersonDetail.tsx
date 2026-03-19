import { useState, useEffect, useCallback } from "react";
import type { Person, NoteTarget } from "../../api/types";
import type { TwentyClient } from "../../api/twenty-client";
import { getSettings } from "../../utils/storage";
import { NoteEditor } from "./NoteEditor";

interface Props {
  client: TwentyClient;
  person: Person;
  onEdit: (person: Person) => void;
  onBack: () => void;
  inline?: boolean;
}

export function PersonDetail({ client, person, onEdit, onBack, inline }: Props) {
  const [notes, setNotes] = useState<NoteTarget[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [crmUrl, setCrmUrl] = useState("");
  const [freshPerson, setFreshPerson] = useState(person);

  const loadNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const noteTargets = await client.getNotesForPerson(person.id);
      setNotes(noteTargets);
    } catch {
      setNotes([]);
    }
    setLoadingNotes(false);
  }, [client, person.id]);

  useEffect(() => {
    loadNotes();
    getSettings().then((s) => setCrmUrl(s?.crmUrl ?? ""));

    // Fetch fresh person data
    client.getPerson(person.id).then(setFreshPerson).catch(() => {});
  }, [loadNotes, client, person.id]);

  const handleNoteSaved = () => {
    setShowNoteEditor(false);
    loadNotes();
  };

  const p = freshPerson;

  if (inline) {
    return (
      <div className="border-b">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">
              {p.name.firstName} {p.name.lastName}
            </h2>
            {p.jobTitle && <p className="text-xs text-gray-600">{p.jobTitle}</p>}
            {p.city && <p className="text-xs text-gray-500">{p.city}</p>}
          </div>
          <button
            onClick={() => onEdit(p)}
            className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
          >
            Edit
          </button>
        </div>

        <div className="p-3 space-y-1 border-b text-sm">
          {p.emails?.primaryEmail && (
            <InfoRow label="Email" value={p.emails.primaryEmail} />
          )}
          {p.phones?.primaryPhoneNumber && (
            <InfoRow label="Phone" value={p.phones.primaryPhoneNumber} />
          )}
          {crmUrl && (
            <InfoRow
              label="CRM"
              value={`${crmUrl}/objects/people/${p.id}`}
              isLink
              linkLabel="Open in Twenty"
            />
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-xs">Notes</h3>
            <button
              onClick={() => setShowNoteEditor(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              + Add Note
            </button>
          </div>

          {showNoteEditor && (
            <div className="mb-3">
              <NoteEditor
                client={client}
                personId={person.id}
                onSaved={handleNoteSaved}
                onCancel={() => setShowNoteEditor(false)}
              />
            </div>
          )}

          {loadingNotes ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="text-xs text-gray-400">No notes yet</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((nt) => (
                <li key={nt.id} className="border rounded p-2">
                  <p className="font-medium text-xs">{nt.note?.title || "Untitled"}</p>
                  {nt.note?.bodyV2?.markdown && (
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                      {nt.note.bodyV2.markdown}
                    </p>
                  )}
                  {nt.note?.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(nt.note.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back
        </button>
        <button
          onClick={() => onEdit(p)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b">
          <h2 className="font-semibold text-base">
            {p.name.firstName} {p.name.lastName}
          </h2>
          {p.jobTitle && <p className="text-sm text-gray-600">{p.jobTitle}</p>}
          {p.city && <p className="text-sm text-gray-500">{p.city}</p>}
        </div>

        <div className="p-3 space-y-2 border-b text-sm">
          {p.emails?.primaryEmail && (
            <InfoRow label="Email" value={p.emails.primaryEmail} />
          )}
          {p.phones?.primaryPhoneNumber && (
            <InfoRow label="Phone" value={p.phones.primaryPhoneNumber} />
          )}
          {p.linkedinLink?.primaryLinkUrl && (
            <InfoRow label="LinkedIn" value={p.linkedinLink.primaryLinkUrl} isLink />
          )}
          {crmUrl && (
            <InfoRow
              label="CRM"
              value={`${crmUrl}/objects/people/${p.id}`}
              isLink
              linkLabel="Open in Twenty"
            />
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">Notes</h3>
            <button
              onClick={() => setShowNoteEditor(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              + Add Note
            </button>
          </div>

          {showNoteEditor && (
            <div className="mb-3">
              <NoteEditor
                client={client}
                personId={person.id}
                onSaved={handleNoteSaved}
                onCancel={() => setShowNoteEditor(false)}
              />
            </div>
          )}

          {loadingNotes ? (
            <p className="text-xs text-gray-400">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-xs text-gray-400">No notes yet</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((nt) => (
                <li key={nt.id} className="border rounded p-2">
                  <p className="font-medium text-xs">{nt.note?.title || "Untitled"}</p>
                  {nt.note?.bodyV2?.markdown && (
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                      {nt.note.bodyV2.markdown}
                    </p>
                  )}
                  {nt.note?.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(nt.note.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink = false,
  linkLabel,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  linkLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-16 shrink-0">{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate"
        >
          {linkLabel ?? value}
        </a>
      ) : (
        <span className="truncate">{value}</span>
      )}
    </div>
  );
}

import { useState } from "react";
import type { Person, LinkedInProfileData } from "../../api/types";
import type { TwentyClient } from "../../api/twenty-client";

interface Props {
  client: TwentyClient;
  customFieldMap: Record<string, string>;
  existingPerson?: Person;
  linkedInProfile?: LinkedInProfileData | null;
  onSaved: (person: Person) => void;
  onCancel: () => void;
}

const ANREDE_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "PER_DU", label: "per Du" },
  { value: "PER_SIE", label: "per Sie" },
];
const KOMMUNIKATION_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "E_MAIL", label: "E-Mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "ANRUF", label: "Anruf" },
  { value: "LINKEDIN", label: "LinkedIn" },
];

export function PersonForm({
  client,
  customFieldMap,
  existingPerson,
  linkedInProfile,
  onSaved,
  onCancel,
}: Props) {
  const isEdit = !!existingPerson;

  const [firstName, setFirstName] = useState(
    existingPerson?.name.firstName ?? linkedInProfile?.firstName ?? ""
  );
  const [lastName, setLastName] = useState(
    existingPerson?.name.lastName ?? linkedInProfile?.lastName ?? ""
  );
  const [email, setEmail] = useState(
    existingPerson?.emails?.primaryEmail ?? ""
  );
  const [phone, setPhone] = useState(
    existingPerson?.phones?.primaryPhoneNumber ?? ""
  );
  const [jobTitle, setJobTitle] = useState(
    existingPerson?.jobTitle ?? linkedInProfile?.headline ?? ""
  );
  const [city, setCity] = useState(
    existingPerson?.city ?? linkedInProfile?.location ?? ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    existingPerson?.linkedinLink?.primaryLinkUrl ?? linkedInProfile?.profileUrl ?? ""
  );
  const [anrede, setAnrede] = useState(
    (existingPerson?.[customFieldMap["Anrede"] ?? "anrede"] as string) ?? ""
  );
  const [begegnungen, setBegegnungen] = useState(
    (existingPerson?.[customFieldMap["Begegnungen"] ?? "begegnungen"] as string) ?? ""
  );
  const [kommunikation, setKommunikation] = useState(
    (existingPerson?.[
      customFieldMap["Primäres Kommunikationsmedium"] ?? "primeresKommunikationsmedium"
    ] as string) ?? ""
  );
  const [reminder, setReminder] = useState(
    (existingPerson?.[customFieldMap["Reminder"] ?? "reminder"] as string) ?? ""
  );
  const [company, setCompany] = useState(linkedInProfile?.company ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }

    setSaving(true);
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      name: { firstName: firstName.trim(), lastName: lastName.trim() },
      emails: { primaryEmail: email.trim(), additionalEmails: [] },
      phones: { primaryPhoneNumber: phone.trim(), additionalPhones: [] },
      linkedinLink: {
        primaryLinkUrl: linkedinUrl.trim(),
        primaryLinkLabel: "LinkedIn",
      },
      jobTitle: jobTitle.trim(),
      city: city.trim(),
    };

    // Add custom fields
    const anredeKey = customFieldMap["Anrede"] ?? "anrede";
    const begegnungenKey = customFieldMap["Begegnungen"] ?? "begegnungen";
    const kommKey =
      customFieldMap["Primäres Kommunikationsmedium"] ?? "primeresKommunikationsmedium";
    const reminderKey = customFieldMap["Reminder"] ?? "reminder";

    if (anrede) data[anredeKey] = anrede;
    if (begegnungen) data[begegnungenKey] = begegnungen;
    if (kommunikation) data[kommKey] = kommunikation;
    if (reminder) data[reminderKey] = reminder;

    try {
      let person: Person;
      if (isEdit && existingPerson) {
        person = await client.updatePerson(existingPerson.id, data);
      } else {
        person = await client.createPerson(data);
      }
      onSaved(person);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h2 className="font-semibold text-sm">
          {isEdit ? "Edit Person" : "New Person"}
        </h2>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-3">
        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="First Name" value={firstName} onChange={setFirstName} required />
          <Field label="Last Name" value={lastName} onChange={setLastName} required />
        </div>

        <SelectField
          label="Anrede"
          value={anrede}
          onChange={setAnrede}
          options={ANREDE_OPTIONS.map(o => o.value)}
          labels={ANREDE_OPTIONS.map(o => o.label)}
        />

        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
        <Field label="Job Title" value={jobTitle} onChange={setJobTitle} />
        <Field label="Company" value={company} onChange={setCompany} />
        <Field label="City" value={city} onChange={setCity} />
        <Field label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} type="url" />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Begegnungen
          </label>
          <textarea
            value={begegnungen}
            onChange={(e) => setBegegnungen(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SelectField
          label="Primäres Kommunikationsmedium"
          value={kommunikation}
          onChange={setKommunikation}
          options={KOMMUNIKATION_OPTIONS.map(o => o.value)}
          labels={KOMMUNIKATION_OPTIONS.map(o => o.label)}
        />

        <div>
          <Field label="Reminder" value={reminder} onChange={setReminder} type="date" />
          <div className="flex gap-1 mt-1">
            {([
              ["Tomorrow", 1],
              ["In a week", 7],
              ["In a month", 30],
            ] as const).map(([label, days]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  setReminder(d.toISOString().slice(0, 10));
                }}
                className="px-2 py-0.5 text-xs border rounded hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : isEdit ? "Update Person" : "Create Person"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {labels?.[i] ?? (opt || "— Select —")}
          </option>
        ))}
      </select>
    </div>
  );
}

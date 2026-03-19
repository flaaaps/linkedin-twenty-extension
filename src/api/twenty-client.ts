import type {
  Person,
  PersonCreateInput,
  PersonUpdateInput,
  Note,
  NoteTarget,
  MetadataField,
} from "./types";

export class TwentyClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    console.log("[Twenty API]", options.method ?? "GET", url);
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Twenty API] Error:", res.status, body);
      throw new Error(`API ${res.status}: ${body}`);
    }

    const json = await res.json();
    console.log("[Twenty API] Response:", JSON.stringify(json).slice(0, 500));
    return json;
  }

  async searchPeople(query: string): Promise<Person[]> {
    const q = encodeURIComponent(query);
    const res = await this.request<{ data: { people: Person[] } }>(
      `/rest/people?filter=or(name.firstName[ilike]:${q},name.lastName[ilike]:${q})&limit=10`
    );
    return res.data?.people ?? [];
  }

  async findByLinkedIn(url: string): Promise<Person | null> {
    const normalizedUrl = encodeURIComponent(url.replace(/\/$/, ""));
    const res = await this.request<{ data: { people: Person[] } }>(
      `/rest/people?filter=linkedinLink.primaryLinkUrl[eq]:${normalizedUrl}&limit=1`
    );
    const people = res.data?.people ?? [];
    return people.length > 0 ? people[0] : null;
  }

  async createPerson(data: PersonCreateInput): Promise<Person> {
    const res = await this.request<{ data: { createPerson: Person } }>("/rest/people", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data.createPerson;
  }

  async updatePerson(id: string, data: PersonUpdateInput): Promise<Person> {
    const res = await this.request<{ data: { updatePerson: Person } }>(`/rest/people/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data.updatePerson;
  }

  async getPerson(id: string): Promise<Person> {
    const res = await this.request<{ data: { person: Person } }>(`/rest/people/${id}`);
    return res.data.person;
  }

  async createNote(title: string, body: string): Promise<Note> {
    const block = {
      id: crypto.randomUUID(),
      type: "paragraph",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: body, styles: {} }],
      children: [],
    };
    const res = await this.request<{ data: { createNote: Note } }>("/rest/notes", {
      method: "POST",
      body: JSON.stringify({
        title,
        bodyV2: {
          blocknote: JSON.stringify([block]),
          markdown: body,
        },
      }),
    });
    return res.data.createNote;
  }

  async linkNoteToContact(noteId: string, personId: string): Promise<NoteTarget> {
    const res = await this.request<{ data: { createNoteTarget: NoteTarget } }>("/rest/noteTargets", {
      method: "POST",
      body: JSON.stringify({ noteId, personId }),
    });
    return res.data.createNoteTarget;
  }

  async getNotesForPerson(personId: string): Promise<NoteTarget[]> {
    const res = await this.request<{ data: { noteTargets: NoteTarget[] } }>(
      `/rest/noteTargets?filter=personId[eq]:${personId}&depth=2`
    );
    return res.data?.noteTargets ?? [];
  }

  async getMetadataFields(): Promise<MetadataField[]> {
    const res = await this.request<{ data: { fields: MetadataField[] } }>(
      "/rest/metadata/fields"
    );
    return res.data?.fields ?? [];
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getMetadataFields();
      return true;
    } catch {
      return false;
    }
  }
}

export interface PersonName {
  firstName: string;
  lastName: string;
}

export interface PersonEmails {
  primaryEmail: string;
  additionalEmails: string[];
}

export interface PersonPhones {
  primaryPhoneNumber: string;
  additionalPhones: string[];
}

export interface PersonLinkedIn {
  primaryLinkUrl: string;
  primaryLinkLabel: string;
}

export interface Person {
  id: string;
  name: PersonName;
  emails: PersonEmails;
  phones: PersonPhones;
  linkedinLink: PersonLinkedIn;
  jobTitle: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  // Custom fields — actual API names resolved via metadata
  [key: string]: unknown;
}

export interface PersonCreateInput {
  name: PersonName;
  emails?: PersonEmails;
  phones?: PersonPhones;
  linkedinLink?: PersonLinkedIn;
  jobTitle?: string;
  city?: string;
  [key: string]: unknown;
}

export interface PersonUpdateInput {
  name?: PersonName;
  emails?: PersonEmails;
  phones?: PersonPhones;
  linkedinLink?: PersonLinkedIn;
  jobTitle?: string;
  city?: string;
  [key: string]: unknown;
}

export interface Note {
  id: string;
  title: string;
  bodyV2: {
    blocknote: string;
    markdown: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTarget {
  id: string;
  noteId: string;
  personId: string;
  note?: Note;
}

export interface MetadataField {
  id: string;
  name: string;
  label: string;
  type: string;
  objectMetadataId: string;
}

export interface ApiListResponse<T> {
  data: T[];
  totalCount?: number;
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface LinkedInProfileData {
  fullName: string;
  firstName: string;
  lastName: string;
  profileUrl: string;
  headline: string;
  location: string;
}

export interface ExtensionSettings {
  crmUrl: string;
  apiKey: string;
  customFieldMap?: Record<string, string>;
}

export type MessageType =
  | { type: "LINKEDIN_PROFILE_DATA"; data: LinkedInProfileData }
  | { type: "LINKEDIN_NO_PROFILE" }
  | { type: "REQUEST_PROFILE_DATA" };

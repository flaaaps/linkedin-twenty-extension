# LinkedIn Twenty CRM Extension

A Chrome extension that connects LinkedIn with your self-hosted [Twenty CRM](https://twenty.com) instance. Browse LinkedIn profiles and instantly look up, create, or update contacts in your CRM — without switching tabs.

## Features

- **Auto-detect LinkedIn profiles** — when you visit a profile, the extension automatically checks if the person exists in your CRM
- **Inline CRM view** — see contact details, notes, and custom fields directly in the extension popup
- **Create contacts** — add new people to your CRM with data pre-filled from LinkedIn (name, headline, company, location, profile URL)
- **Edit contacts** — update fields like Anrede, Kommunikationsmedium, Begegnungen, and Reminder
- **Notes** — create and view notes linked to a person
- **Search** — manually search your CRM by name
- **Reminder quick buttons** — set follow-up reminders for tomorrow, in a week, or in a month

## Installation

### From a Release (recommended)

1. Go to the [Releases](https://github.com/flaaaps/linkedin-twenty-extension/releases) page
2. Download `linkedin-twenty-crm.zip` from the latest release
3. Unzip the file
4. Open `chrome://extensions` in your browser (works in Chrome, Edge, Brave, and other Chromium browsers)
5. Enable **Developer mode** (toggle in the top right)
6. Click **Load unpacked** and select the unzipped folder
7. The extension icon should appear in your toolbar

### Build from Source

```bash
git clone https://github.com/flaaaps/linkedin-twenty-extension.git
cd linkedin-twenty-extension
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension (see steps 4-7 above).

To create a distributable zip:

```bash
npm run package
```

This produces `linkedin-twenty-crm.zip` in the project root.

## Setup

1. Click the extension icon to open the popup
2. Enter your Twenty CRM URL (e.g. `https://crm.example.com`)
3. Enter your API key (generate one in Twenty under Settings > API Keys)
4. Click **Test Connection** to verify, then **Save Settings**

## Usage

1. Navigate to any LinkedIn profile
2. Click the extension icon — if the person is in your CRM, their details appear at the top
3. If they're not in the CRM, click **Add to CRM** to create them with pre-filled data
4. Use the search bar to find any contact by name
5. Click a search result to view their full details, edit fields, or add notes

## Development

```bash
npm run dev     # Build in watch mode
npm run build   # Production build to dist/
npm run package # Build + zip for distribution
```

## Tech Stack

- React 18 + TypeScript
- Vite (build)
- Tailwind CSS
- Chrome Extension Manifest V3
- Twenty CRM REST API

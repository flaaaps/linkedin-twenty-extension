import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../../utils/storage";
import { TwentyClient } from "../../api/twenty-client";

interface Props {
  onSaved: () => void;
}

export function SettingsView({ onSaved }: Props) {
  const [crmUrl, setCrmUrl] = useState("https://crm.studypilot.app");
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setCrmUrl(s.crmUrl || "https://crm.studypilot.app");
        setApiKey(s.apiKey || "");
      }
    });
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const client = new TwentyClient(crmUrl, apiKey);
      const ok = await client.testConnection();
      setTestResult(ok ? "success" : "error");
    } catch {
      setTestResult("error");
    }
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveSettings({ crmUrl, apiKey });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-semibold text-lg">Settings</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Twenty CRM URL
        </label>
        <input
          type="url"
          value={crmUrl}
          onChange={(e) => setCrmUrl(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://crm.studypilot.app"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your API key"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTest}
          disabled={testing || !crmUrl || !apiKey}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {testing ? "Testing..." : "Test Connection"}
        </button>
        {testResult === "success" && (
          <span className="text-green-600 text-sm self-center">Connected!</span>
        )}
        {testResult === "error" && (
          <span className="text-red-600 text-sm self-center">Connection failed</span>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !crmUrl || !apiKey}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

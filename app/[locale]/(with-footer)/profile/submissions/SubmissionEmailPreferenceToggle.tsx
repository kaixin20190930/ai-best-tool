'use client';

import { useState } from 'react';
import { updateMySubmissionEmailPreference } from '@/app/actions/userPreferences';

export default function SubmissionEmailPreferenceToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (next: boolean) => {
    setEnabled(next);
    setSaving(true);
    setError(null);

    const result = await updateMySubmissionEmailPreference(next);
    setSaving(false);

    if (!result.success) {
      setEnabled(!next);
      setError(result.error || 'Failed to save preference.');
    }
  };

  return (
    <section className="theme-surface mb-6 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Submission Status Emails</h2>
          <p className="mt-1 text-sm text-slate-600">
            Receive email updates when your submitted tools are reviewed or published.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => handleChange(event.target.checked)}
            disabled={saving}
            className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
          />
          {enabled ? 'Enabled' : 'Disabled'}
        </label>
      </div>
      {saving && <p className="mt-2 text-xs text-slate-500">Saving...</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-500">
        This setting currently uses the existing notification preference field.
      </p>
    </section>
  );
}

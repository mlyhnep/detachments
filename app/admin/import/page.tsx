"use client";

import { useActionState } from "react";
import { importDetachments } from "./import-actions";

const EXAMPLE = `[
  {
    "faction": "Space Marines",
    "name": "Gladius Task Force",
    "dp_cost": 2,
    "tags": ["Combined Arms"],
    "dispositions": ["Purge the Foe", "Take and Hold"],
    "rule_text": "...",
    "source": "Codex: Space Marines",
    "notes": ""
  }
]`;

export default function AdminImportPage() {
  const [state, action, pending] = useActionState(importDetachments, null);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold">Import detachments</h1>
        <p className="mb-6 text-sm text-gray-400">
          Paste a JSON array of detachment objects. The first entry in{" "}
          <code className="text-gray-300">dispositions</code> is treated as
          the primary disposition. Unknown factions are created automatically;
          unknown disposition names are rejected. Existing detachments are
          matched and updated by faction + name.
        </p>

        <form action={action} className="flex flex-col gap-4">
          {state?.error && (
            <p className="whitespace-pre-wrap rounded bg-red-900/50 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="rounded bg-green-900/50 px-3 py-2 text-sm text-green-300">
              {state.success} ({state.importedCount} detachment
              {state.importedCount === 1 ? "" : "s"} imported.)
            </p>
          )}

          <textarea
            name="json"
            required
            rows={18}
            spellCheck={false}
            placeholder={EXAMPLE}
            className="rounded border border-gray-700 bg-gray-900 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-gray-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50"
          >
            {pending ? "Importing…" : "Import"}
          </button>
        </form>
      </div>
    </main>
  );
}

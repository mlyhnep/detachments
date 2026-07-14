"use client";

import { useActionState } from "react";
import { updateDetachmentRuleText } from "./edit-actions";

export default function EditForm({
  id,
  ruleText,
  source,
  notes,
}: {
  id: number;
  ruleText: string | null;
  source: string | null;
  notes: string | null;
}) {
  const [state, action, pending] = useActionState(updateDetachmentRuleText, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />

      {state?.error && (
        <p className="rounded bg-red-900/50 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}

      {notes && (
        <div className="rounded border border-gray-800 bg-gray-900 p-3">
          <p className="mb-1 text-xs font-medium text-gray-500">Auto-generated summary (read-only)</p>
          <p className="text-sm text-gray-400">{notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400" htmlFor="rule_text">
          Rule text
        </label>
        <textarea
          id="rule_text"
          name="rule_text"
          rows={10}
          defaultValue={ruleText ?? ""}
          placeholder="Paste the detachment's rule text here"
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400" htmlFor="source">
          Source
        </label>
        <input
          id="source"
          name="source"
          type="text"
          defaultValue={source ?? ""}
          placeholder="e.g. Codex: Space Marines"
          className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-white px-4 py-2 font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Disposition, Faction } from "@/lib/types";

function toggleInList(csv: string | null, id: number): string {
  const ids = csv ? csv.split(",").map(Number) : [];
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  return next.join(",");
}

export default function DetachmentFilters({
  factions,
  dispositions,
}: {
  factions: Faction[];
  dispositions: Disposition[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const factionCsv = searchParams.get("faction");
  const dispositionCsv = searchParams.get("disposition");
  const dpCsv = searchParams.get("dp");
  const tags = searchParams.get("tags") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/detachments?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-400">Faction</h3>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          {factions.map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={(factionCsv ? factionCsv.split(",").map(Number) : []).includes(f.id)}
                onChange={() => updateParam("faction", toggleInList(factionCsv, f.id))}
                className="accent-white"
              />
              {f.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-400">Disposition</h3>
        <div className="flex flex-col gap-1">
          {dispositions.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={(dispositionCsv ? dispositionCsv.split(",").map(Number) : []).includes(d.id)}
                onChange={() => updateParam("disposition", toggleInList(dispositionCsv, d.id))}
                className="accent-white"
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-400">DP cost</h3>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((dp) => {
            const selected = (dpCsv ? dpCsv.split(",").map(Number) : []).includes(dp);
            return (
              <button
                key={dp}
                type="button"
                onClick={() => updateParam("dp", toggleInList(dpCsv, dp))}
                className={`h-9 w-9 rounded border text-sm transition-colors ${
                  selected
                    ? "border-white bg-white text-gray-900 font-medium"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                }`}
              >
                {dp}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-400">Tags</h3>
        <input
          type="text"
          placeholder="comma separated"
          defaultValue={tags}
          onBlur={(e) => updateParam("tags", e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white"
        />
      </div>

      {(factionCsv || dispositionCsv || dpCsv || tags) && (
        <button
          onClick={() => router.push("/detachments")}
          className="self-start text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

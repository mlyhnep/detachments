"use client";

import { useState } from "react";
import type { Disposition, Matchup } from "@/lib/types";
import { findMatchup, myMissionName } from "@/lib/matchup-lookup";

export default function MatchupGrid({
  dispositions,
  matchups,
}: {
  dispositions: Disposition[];
  matchups: Matchup[];
}) {
  const [selected, setSelected] = useState<{ a: number; b: number } | null>(null);

  const selectedMatchup = selected ? findMatchup(matchups, selected.a, selected.b) : undefined;
  const selectedDispositionA = selected
    ? dispositions.find((d) => d.id === selected.a)
    : undefined;
  const selectedDispositionB = selected
    ? dispositions.find((d) => d.id === selected.b)
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-32" />
              {dispositions.map((d) => (
                <th
                  key={d.id}
                  className="w-32 px-2 pb-2 text-left text-xs font-medium text-gray-400"
                >
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dispositions.map((rowD) => (
              <tr key={rowD.id}>
                <th className="pr-3 py-1 text-right text-xs font-medium text-gray-400 whitespace-nowrap">
                  {rowD.name}
                </th>
                {dispositions.map((colD) => {
                  const isSelected =
                    selected &&
                    ((selected.a === rowD.id && selected.b === colD.id) ||
                      (selected.a === colD.id && selected.b === rowD.id));
                  const isMirror = rowD.id === colD.id;
                  const cellMatchup = findMatchup(matchups, rowD.id, colD.id);
                  const missionName = cellMatchup ? myMissionName(cellMatchup, rowD.id) : null;
                  return (
                    <td key={colD.id} className="p-1">
                      <button
                        onClick={() => setSelected({ a: rowD.id, b: colD.id })}
                        className={`flex h-14 w-full items-center justify-center rounded border px-1.5 text-center text-[11px] leading-tight transition-colors ${
                          isSelected
                            ? "border-white bg-gray-700 text-white"
                            : isMirror
                              ? "border-gray-800 bg-gray-900/60 text-gray-400 hover:border-gray-600"
                              : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {missionName ?? (isMirror ? "Mirror" : "")}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          {!selectedMatchup ? (
            <p className="text-sm text-gray-500 italic">
              No matchup data seeded yet for this pairing — run scripts/seed-reference-data.mjs.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-400">
                  {selectedDispositionA?.name} mission
                </h3>
                <p className="text-white">{selectedMatchup.mission_name_a}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-400">
                  {selectedDispositionB?.name} mission
                </h3>
                <p className="text-white">{selectedMatchup.mission_name_b}</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-1 text-sm font-medium text-gray-400">Objectives</h3>
                {selectedMatchup.objectives_summary ? (
                  <p className="text-sm text-gray-300">{selectedMatchup.objectives_summary}</p>
                ) : (
                  <p className="text-sm text-gray-600 italic">Not added yet.</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-1 text-sm font-medium text-gray-400">Layout variants</h3>
                {selectedMatchup.layout_variants ? (
                  <ul className="flex flex-col gap-1">
                    {selectedMatchup.layout_variants.map((v, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {i + 1}. {v}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 italic">Not added yet.</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-1 text-sm font-medium text-gray-400">Play tips</h3>
                {selectedMatchup.play_tips ? (
                  <p className="text-sm text-gray-300">{selectedMatchup.play_tips}</p>
                ) : (
                  <p className="text-sm text-gray-600 italic">Not added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

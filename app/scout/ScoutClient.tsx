"use client";

import { useMemo, useState } from "react";
import type {
  Disposition,
  DispositionTip,
  Faction,
  Matchup,
  DetachmentWithFaction,
} from "@/lib/types";
import FactionPicker from "./FactionPicker";
import MyDetachmentCard from "./MyDetachmentCard";
import DispositionMatchRow from "./DispositionMatchRow";

export default function ScoutClient({
  factions,
  detachments,
  dispositions,
  dispositionTips,
  matchups,
}: {
  factions: Faction[];
  detachments: DetachmentWithFaction[];
  dispositions: Disposition[];
  dispositionTips: DispositionTip[];
  matchups: Matchup[];
}) {
  const [myFactionIds, setMyFactionIds] = useState<number[]>([]);
  const [enemyFactionIds, setEnemyFactionIds] = useState<number[]>([]);
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const dispositionNameById = useMemo(
    () => new Map(dispositions.map((d) => [d.id, d.name])),
    [dispositions]
  );

  const myDetachments = useMemo(
    () => detachments.filter((d) => myFactionIds.includes(d.faction_id)),
    [detachments, myFactionIds]
  );

  const selectedId = hoverId ?? pinnedId;
  const selected = useMemo(
    () => detachments.find((d) => d.id === selectedId),
    [detachments, selectedId]
  );

  const primaryDispositionId = selected?.disposition_ids[0];

  const tipsForPrimary = useMemo(() => {
    if (primaryDispositionId === undefined) return [];
    return dispositionTips
      .filter((t) => t.disposition_id === primaryDispositionId)
      .sort((a, b) => a.ordering - b.ordering);
  }, [dispositionTips, primaryDispositionId]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-6">
        <FactionPicker
          label="My armies"
          factions={factions}
          selectedIds={myFactionIds}
          onChange={setMyFactionIds}
        />
        <FactionPicker
          label="Enemy armies"
          factions={factions}
          selectedIds={enemyFactionIds}
          onChange={setEnemyFactionIds}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_320px_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-gray-400">My detachments</h2>
          {myFactionIds.length === 0 ? (
            <p className="text-sm text-gray-600 italic">Pick your army faction(s) above.</p>
          ) : myDetachments.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              No detachments seeded yet for these factions.
            </p>
          ) : (
            myDetachments.map((d) => (
              <MyDetachmentCard
                key={d.id}
                detachment={d}
                dispositionNameById={dispositionNameById}
                isSelected={selectedId === d.id}
                onMouseEnter={() => setHoverId(d.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => setPinnedId(d.id)}
              />
            ))
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-400">Detail</h2>
          {!selected ? (
            <p className="text-sm text-gray-600 italic">
              Hover or click a detachment to see its rule and tips.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <h3 className="mb-1 font-medium text-white">{selected.name}</h3>
              <p className="mb-3 text-xs text-gray-500">{selected.faction_name}</p>

              <div className="mb-3 flex flex-wrap gap-1">
                {selected.disposition_ids.map((id, i) => (
                  <span
                    key={id}
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      i === 0 ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {dispositionNameById.get(id) ?? "?"}
                    {i === 0 ? " (primary)" : ""}
                  </span>
                ))}
              </div>

              {selected.rule_text && (
                <p className="mb-3 whitespace-pre-wrap text-sm text-gray-300">
                  {selected.rule_text}
                </p>
              )}

              {tipsForPrimary.length > 0 && (
                <>
                  <h4 className="mb-1 text-xs font-medium text-gray-500">
                    {dispositionNameById.get(primaryDispositionId!)} tips
                  </h4>
                  <ul className="flex flex-col gap-1">
                    {tipsForPrimary.map((t) => (
                      <li key={t.id} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-gray-600">-</span>
                        <span>{t.tip}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-gray-400">Likely matchups</h2>
          {!selected ? (
            <p className="text-sm text-gray-600 italic">
              Select a detachment to see missions and scouted enemy detachments.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {dispositions.map((enemyDisposition) => {
                const scouted = detachments.filter(
                  (ed) =>
                    enemyFactionIds.includes(ed.faction_id) &&
                    ed.disposition_ids.includes(enemyDisposition.id)
                );
                return (
                  <DispositionMatchRow
                    key={enemyDisposition.id}
                    myDispositionId={primaryDispositionId!}
                    enemyDisposition={enemyDisposition}
                    matchups={matchups}
                    scoutedDetachments={scouted}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

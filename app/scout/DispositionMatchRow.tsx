import type { Disposition, DetachmentWithFaction, Matchup } from "@/lib/types";
import { findMatchup, myMissionName } from "@/lib/matchup-lookup";

export default function DispositionMatchRow({
  myDispositionId,
  enemyDisposition,
  matchups,
  scoutedDetachments,
}: {
  myDispositionId: number;
  enemyDisposition: Disposition;
  matchups: Matchup[];
  scoutedDetachments: DetachmentWithFaction[];
}) {
  const matchup = findMatchup(matchups, myDispositionId, enemyDisposition.id);
  const isEmpty = scoutedDetachments.length === 0;

  return (
    <div
      style={{ order: isEmpty ? 1 : 0 }}
      className={`grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 ${
        isEmpty
          ? "border-gray-900 bg-gray-950/40 opacity-60"
          : "border-gray-800 bg-gray-900"
      }`}
    >
      <div>
        <h3 className="mb-1 text-xs font-medium text-gray-500">
          If enemy runs {enemyDisposition.name}
        </h3>
        {!matchup ? (
          <p className="text-sm text-gray-600 italic">No matchup data seeded yet.</p>
        ) : (
          <>
            <p className="mb-1 font-medium text-white">
              {myMissionName(matchup, myDispositionId)}
            </p>
            {matchup.play_tips && <p className="text-sm text-gray-400">{matchup.play_tips}</p>}
          </>
        )}
      </div>

      <div>
        {isEmpty ? (
          <p className="text-sm text-gray-600 italic">No scouted detachments for this</p>
        ) : (
          <>
            <h3 className="mb-1 text-xs font-medium text-gray-500">
              {scoutedDetachments.length} detachment
              {scoutedDetachments.length === 1 ? "" : "s"} scouted:
            </h3>
            <ul className="flex flex-col gap-0.5">
              {scoutedDetachments.map((d) => (
                <li key={d.id} className="text-sm text-gray-300">
                  {d.name} <span className="text-gray-500">({d.faction_name})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

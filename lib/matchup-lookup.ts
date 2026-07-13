import type { Matchup } from "@/lib/types";

/**
 * matchups rows store each unordered disposition pair once, with
 * disposition_a_id <= disposition_b_id. Any lookup must normalize to that
 * canonical order first.
 */
export function findMatchup(
  matchups: Matchup[],
  dispositionX: number,
  dispositionY: number
): Matchup | undefined {
  const a = Math.min(dispositionX, dispositionY);
  const b = Math.max(dispositionX, dispositionY);
  return matchups.find((m) => m.disposition_a_id === a && m.disposition_b_id === b);
}

/**
 * Given "my" disposition and the matchup for (my, enemy), returns the
 * mission name for my side. disposition_a_id/b_id may not match the
 * (my, enemy) order, since matchups are stored canonically.
 */
export function myMissionName(matchup: Matchup, myDispositionId: number): string {
  return matchup.disposition_a_id === myDispositionId
    ? matchup.mission_name_a
    : matchup.mission_name_b;
}

export type Faction = {
  id: number;
  name: string;
};

export type Disposition = {
  id: number;
  name: string;
  description: string | null;
};

export type DispositionTip = {
  id: number;
  disposition_id: number;
  tip: string;
  ordering: number;
};

export type Detachment = {
  id: number;
  faction_id: number;
  name: string;
  dp_cost: number;
  tags: string[];
  /** disposition_ids[0] is the primary disposition; the rest are informational. */
  disposition_ids: number[];
  rule_text: string | null;
  source: string | null;
  notes: string | null;
};

export type DetachmentWithFaction = Detachment & {
  faction_name: string;
};

export type Matchup = {
  id: number;
  disposition_a_id: number;
  disposition_b_id: number;
  mission_name_a: string;
  mission_name_b: string;
  objectives_summary: string | null;
  layout_variants: string[] | null;
  play_tips: string | null;
};

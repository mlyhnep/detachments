"use server";

import { createClient } from "@/lib/supabase/server";

type ImportRow = {
  faction: string;
  name: string;
  dp_cost: number;
  tags?: string[];
  /** First entry is the primary disposition (drives the scouting view). */
  dispositions: string[];
  rule_text?: string;
  source?: string;
  notes?: string;
};

export type ImportState = {
  error?: string;
  success?: string;
  importedCount?: number;
} | null;

function parseRows(raw: string): { rows: ImportRow[] } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON — could not parse the pasted text." };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Expected a JSON array of detachment objects." };
  }

  for (const [i, item] of parsed.entries()) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Record<string, unknown>).faction !== "string" ||
      typeof (item as Record<string, unknown>).name !== "string" ||
      typeof (item as Record<string, unknown>).dp_cost !== "number" ||
      !Array.isArray((item as Record<string, unknown>).dispositions) ||
      (item as { dispositions: unknown[] }).dispositions.length === 0
    ) {
      return {
        error: `Row ${i + 1}: each detachment needs at least "faction" (string), "name" (string), "dp_cost" (number), and a non-empty "dispositions" (string array, first = primary).`,
      };
    }
  }

  return { rows: parsed as ImportRow[] };
}

export async function importDetachments(
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  const raw = (formData.get("json") as string) ?? "";
  const parsed = parseRows(raw);
  if ("error" in parsed) return { error: parsed.error };
  const { rows } = parsed;

  const supabase = await createClient();

  const { data: dispositions, error: dispositionsError } = await supabase
    .from("dispositions")
    .select("id, name");
  if (dispositionsError) return { error: dispositionsError.message };

  const dispositionIdByName = new Map(
    (dispositions ?? []).map((d) => [d.name.toLowerCase(), d.id])
  );

  const { data: factions, error: factionsError } = await supabase
    .from("factions")
    .select("id, name");
  if (factionsError) return { error: factionsError.message };

  const factionIdByName = new Map(
    (factions ?? []).map((f) => [f.name.toLowerCase(), f.id])
  );

  const detachmentRows: {
    faction_id: number;
    name: string;
    dp_cost: number;
    tags: string[];
    disposition_ids: number[];
    rule_text: string | null;
    source: string | null;
    notes: string | null;
  }[] = [];

  for (const [i, row] of rows.entries()) {
    let factionId = factionIdByName.get(row.faction.toLowerCase());
    if (factionId === undefined) {
      const { data: newFaction, error: insertError } = await supabase
        .from("factions")
        .insert({ name: row.faction })
        .select("id, name")
        .single();
      if (insertError || !newFaction) {
        return {
          error: `Row ${i + 1}: failed to create faction "${row.faction}": ${insertError?.message}`,
        };
      }
      factionId = newFaction.id;
      factionIdByName.set(newFaction.name.toLowerCase(), newFaction.id);
    }

    const dispositionIds: number[] = [];
    for (const dName of row.dispositions) {
      const dId = dispositionIdByName.get(dName.toLowerCase());
      if (dId === undefined) {
        return {
          error: `Row ${i + 1}: unknown disposition "${dName}". Must be one of: ${[
            ...dispositionIdByName.keys(),
          ].join(", ")}.`,
        };
      }
      dispositionIds.push(dId);
    }

    detachmentRows.push({
      faction_id: factionId,
      name: row.name,
      dp_cost: row.dp_cost,
      tags: row.tags ?? [],
      disposition_ids: dispositionIds,
      rule_text: row.rule_text ?? null,
      source: row.source ?? null,
      notes: row.notes ?? null,
    });
  }

  const { error: upsertError } = await supabase
    .from("detachments")
    .upsert(detachmentRows, { onConflict: "faction_id,name" });

  if (upsertError) return { error: upsertError.message };

  return {
    success: "Import complete.",
    importedCount: detachmentRows.length,
  };
}

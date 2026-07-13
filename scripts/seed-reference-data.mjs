#!/usr/bin/env node
/**
 * Seed dispositions, disposition_tips, and matchups from hand-authored JSON.
 *
 * Source files (edit these, not this script):
 *   data/reference-content/dispositions.json
 *     [{ "name": "Take and Hold", "description": "...", "tips": ["...", "..."] }, ...]
 *   data/reference-content/matchups.json
 *     [{
 *       "disposition_a": "Take and Hold", "disposition_b": "Purge the Foe",
 *       "mission_name_a": "...", "mission_name_b": "...",
 *       "objectives_summary": "...", "layout_variants": ["...", "...", "..."],
 *       "play_tips": "..."
 *     }, ...]
 *
 * Dry run (default) — validates and prints a summary, writes nothing:
 *   $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-reference-data.mjs
 *
 * Apply — upserts into Supabase:
 *   $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-reference-data.mjs --apply
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "reference-content");

const SUPABASE_URL = "https://cozjhyhnpljclqonjiad.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const APPLY = process.argv.includes("--apply");

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY.");
  console.error('Run as: $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-reference-data.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dispositions = JSON.parse(readFileSync(join(DATA_DIR, "dispositions.json"), "utf-8"));
const matchups = JSON.parse(readFileSync(join(DATA_DIR, "matchups.json"), "utf-8"));

if (dispositions.length === 0) {
  console.log("data/reference-content/dispositions.json is empty — nothing to seed. Fill it in first.");
  process.exit(0);
}

console.log(`Loaded ${dispositions.length} dispositions, ${matchups.length} matchups.`);

if (!APPLY) {
  console.log("\nDry run only (pass --apply to write). Preview:");
  for (const d of dispositions) {
    console.log(`  - ${d.name}: ${d.tips?.length ?? 0} tips`);
  }
  console.log(`  - ${matchups.length} matchup rows`);
  process.exit(0);
}

// 1. Upsert dispositions by name, keep track of resulting ids.
const dispositionIdByName = new Map();
for (const d of dispositions) {
  const { data, error } = await supabase
    .from("dispositions")
    .upsert({ name: d.name, description: d.description }, { onConflict: "name" })
    .select("id, name")
    .single();
  if (error) {
    console.error(`Failed to upsert disposition "${d.name}": ${error.message}`);
    process.exit(1);
  }
  dispositionIdByName.set(data.name, data.id);
}

// 2. Tips have no natural key besides ordering — delete and reinsert per disposition.
for (const d of dispositions) {
  const dispositionId = dispositionIdByName.get(d.name);
  const { error: deleteError } = await supabase
    .from("disposition_tips")
    .delete()
    .eq("disposition_id", dispositionId);
  if (deleteError) {
    console.error(`Failed to clear tips for "${d.name}": ${deleteError.message}`);
    process.exit(1);
  }

  const tipRows = (d.tips ?? []).map((tip, i) => ({
    disposition_id: dispositionId,
    tip,
    ordering: i,
  }));
  if (tipRows.length > 0) {
    const { error: insertError } = await supabase.from("disposition_tips").insert(tipRows);
    if (insertError) {
      console.error(`Failed to insert tips for "${d.name}": ${insertError.message}`);
      process.exit(1);
    }
  }
}

// 3. Matchups — normalize each pair to canonical (min, max) id order before upsert.
for (const m of matchups) {
  const idA = dispositionIdByName.get(m.disposition_a);
  const idB = dispositionIdByName.get(m.disposition_b);
  if (idA === undefined || idB === undefined) {
    console.error(`Matchup references unknown disposition: ${m.disposition_a} / ${m.disposition_b}`);
    process.exit(1);
  }

  const [canonicalA, canonicalB] = idA <= idB ? [idA, idB] : [idB, idA];
  const [missionA, missionB] =
    idA <= idB
      ? [m.mission_name_a, m.mission_name_b]
      : [m.mission_name_b, m.mission_name_a];

  const { error } = await supabase.from("matchups").upsert(
    {
      disposition_a_id: canonicalA,
      disposition_b_id: canonicalB,
      mission_name_a: missionA,
      mission_name_b: missionB,
      objectives_summary: m.objectives_summary,
      layout_variants: m.layout_variants,
      play_tips: m.play_tips,
    },
    { onConflict: "disposition_a_id,disposition_b_id" }
  );
  if (error) {
    console.error(`Failed to upsert matchup ${m.disposition_a}/${m.disposition_b}: ${error.message}`);
    process.exit(1);
  }
}

console.log(`Done. Seeded ${dispositions.length} dispositions and ${matchups.length} matchups.`);

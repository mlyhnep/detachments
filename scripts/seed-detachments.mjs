#!/usr/bin/env node
/**
 * Bulk-seed factions and detachments from hand-authored JSON. This is a
 * one-time (or occasional re-bulk) tool for launch-day data — after launch,
 * the in-app /admin/import page is the ongoing update mechanism for new
 * faction-pack releases.
 *
 * Source files (edit these, not this script):
 *   data/reference-content/factions.json
 *     ["Space Marines", "Orks", ...]
 *   data/reference-content/detachments.json
 *     [{
 *       "faction": "Space Marines", "name": "Gladius Task Force", "dp_cost": 2,
 *       "tags": ["Combined Arms"], "dispositions": ["Purge the Foe", "Take and Hold"],
 *       "rule_text": "...", "source": "Codex: Space Marines", "notes": ""
 *     }, ...]
 *   (first entry in "dispositions" is the primary disposition)
 *
 * Dry run (default) — validates and prints a summary, writes nothing:
 *   $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-detachments.mjs
 *
 * Apply — upserts into Supabase:
 *   $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-detachments.mjs --apply
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
  console.error('Run as: $env:SUPABASE_SERVICE_KEY="<key>"; node scripts/seed-detachments.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const factionNames = JSON.parse(readFileSync(join(DATA_DIR, "factions.json"), "utf-8"));
const detachments = JSON.parse(readFileSync(join(DATA_DIR, "detachments.json"), "utf-8"));

if (detachments.length === 0) {
  console.log("data/reference-content/detachments.json is empty — nothing to seed. Fill it in first.");
  process.exit(0);
}

console.log(`Loaded ${factionNames.length} factions, ${detachments.length} detachments.`);

if (!APPLY) {
  console.log("\nDry run only (pass --apply to write). Preview:");
  for (const d of detachments.slice(0, 10)) {
    console.log(`  - ${d.faction} / ${d.name} (${d.dp_cost} DP, ${d.dispositions.join(", ")})`);
  }
  if (detachments.length > 10) console.log(`  ...and ${detachments.length - 10} more`);
  process.exit(0);
}

const { data: dispositions, error: dispositionsError } = await supabase
  .from("dispositions")
  .select("id, name");
if (dispositionsError) {
  console.error(`Failed to load dispositions: ${dispositionsError.message}`);
  process.exit(1);
}
const dispositionIdByName = new Map((dispositions ?? []).map((d) => [d.name.toLowerCase(), d.id]));

// 1. Upsert every named faction up front (union of factions.json + any
// faction referenced in detachments.json not already listed there).
const allFactionNames = new Set([...factionNames, ...detachments.map((d) => d.faction)]);
const factionIdByName = new Map();
for (const name of allFactionNames) {
  const { data, error } = await supabase
    .from("factions")
    .upsert({ name }, { onConflict: "name" })
    .select("id, name")
    .single();
  if (error) {
    console.error(`Failed to upsert faction "${name}": ${error.message}`);
    process.exit(1);
  }
  factionIdByName.set(data.name.toLowerCase(), data.id);
}

// 2. Resolve and upsert detachments.
const detachmentRows = [];
for (const d of detachments) {
  const factionId = factionIdByName.get(d.faction.toLowerCase());
  if (factionId === undefined) {
    console.error(`Detachment "${d.name}" references unknown faction "${d.faction}".`);
    process.exit(1);
  }

  const dispositionIds = [];
  for (const dName of d.dispositions) {
    const dId = dispositionIdByName.get(dName.toLowerCase());
    if (dId === undefined) {
      console.error(`Detachment "${d.name}" references unknown disposition "${dName}".`);
      process.exit(1);
    }
    dispositionIds.push(dId);
  }

  detachmentRows.push({
    faction_id: factionId,
    name: d.name,
    dp_cost: d.dp_cost,
    tags: d.tags ?? [],
    disposition_ids: dispositionIds,
    rule_text: d.rule_text ?? null,
    source: d.source ?? null,
    notes: d.notes ?? null,
  });
}

const { error: upsertError } = await supabase
  .from("detachments")
  .upsert(detachmentRows, { onConflict: "faction_id,name" });
if (upsertError) {
  console.error(`Failed to upsert detachments: ${upsertError.message}`);
  process.exit(1);
}

console.log(`Done. Seeded ${allFactionNames.size} factions and ${detachmentRows.length} detachments.`);

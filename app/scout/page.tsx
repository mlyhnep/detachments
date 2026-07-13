import SiteNav from "@/app/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import type { Disposition, DispositionTip, Faction, Matchup, Detachment } from "@/lib/types";
import ScoutClient from "./ScoutClient";

export default async function ScoutPage() {
  const supabase = await createClient();

  const [
    { data: factions },
    { data: detachments },
    { data: dispositions },
    { data: dispositionTips },
    { data: matchups },
  ] = await Promise.all([
    supabase.from("factions").select("*").order("name"),
    supabase.from("detachments").select("*, factions(name)").order("name"),
    supabase.from("dispositions").select("*").order("id"),
    supabase.from("disposition_tips").select("*"),
    supabase.from("matchups").select("*"),
  ]);

  const detachmentsWithFaction = (detachments ?? []).map((d) => {
    const { factions: factionRow, ...rest } = d as Detachment & { factions: { name: string } | null };
    return { ...rest, faction_name: factionRow?.name ?? "Unknown faction" };
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/scout" />

      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Scout
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          Pick your army faction(s) and your opponent&apos;s to plan your list
          around the likely mission and matchup.
        </p>

        {!dispositions || dispositions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No dispositions seeded yet — run scripts/seed-reference-data.mjs.
          </p>
        ) : (
          <ScoutClient
            factions={(factions ?? []) as Faction[]}
            detachments={detachmentsWithFaction}
            dispositions={dispositions as Disposition[]}
            dispositionTips={(dispositionTips ?? []) as DispositionTip[]}
            matchups={(matchups ?? []) as Matchup[]}
          />
        )}
      </main>
    </div>
  );
}

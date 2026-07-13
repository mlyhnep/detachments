import SiteNav from "@/app/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import type { Disposition, Matchup } from "@/lib/types";
import MatchupGrid from "./MatchupGrid";

export default async function MatchupsPage() {
  const supabase = await createClient();

  const [{ data: dispositions }, { data: matchups }] = await Promise.all([
    supabase.from("dispositions").select("*").order("id"),
    supabase.from("matchups").select("*"),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/matchups" />

      <main className="mx-auto max-w-screen-lg px-6 py-10">
        <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Matchup Grid
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          All 15 disposition pairings. Click a cell to see both missions,
          objectives, layout variants, and play tips.
        </p>

        {!dispositions || dispositions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No dispositions seeded yet — run scripts/seed-reference-data.mjs.
          </p>
        ) : (
          <MatchupGrid
            dispositions={dispositions as Disposition[]}
            matchups={(matchups ?? []) as Matchup[]}
          />
        )}
      </main>
    </div>
  );
}

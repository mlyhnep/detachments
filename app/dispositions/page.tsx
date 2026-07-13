import SiteNav from "@/app/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import type { Disposition, DispositionTip } from "@/lib/types";
import DispositionCard from "./DispositionCard";

export default async function DispositionsPage() {
  const supabase = await createClient();

  const [{ data: dispositions }, { data: tips }] = await Promise.all([
    supabase.from("dispositions").select("*").order("id"),
    supabase.from("disposition_tips").select("*").order("disposition_id, ordering"),
  ]);

  const tipsByDisposition = new Map<number, DispositionTip[]>();
  for (const tip of (tips ?? []) as DispositionTip[]) {
    const list = tipsByDisposition.get(tip.disposition_id) ?? [];
    list.push(tip);
    tipsByDisposition.set(tip.disposition_id, list);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/dispositions" />

      <main className="mx-auto max-w-screen-lg px-6 py-10">
        <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Force Dispositions
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          Every detachment unlocks one or more of these. Your army&apos;s
          overall disposition is compared against your opponent&apos;s to
          determine the mission played.
        </p>

        {!dispositions || dispositions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No dispositions seeded yet — run scripts/seed-reference-data.mjs.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(dispositions as Disposition[]).map((d) => (
              <DispositionCard key={d.id} disposition={d} tips={tipsByDisposition.get(d.id) ?? []} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

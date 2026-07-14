import { Suspense } from "react";
import Link from "next/link";
import SiteNav from "@/app/components/SiteNav";
import { createClient } from "@/lib/supabase/server";
import type { Detachment, Disposition, Faction } from "@/lib/types";
import DetachmentFilters from "./DetachmentFilters";

function parseIds(value: string | string[] | undefined): number[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value[0] : value;
  return raw
    .split(",")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

function parseTags(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value[0] : value;
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export default async function DetachmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const factionIds = parseIds(params.faction);
  const dispositionIds = parseIds(params.disposition);
  const tags = parseTags(params.tags);
  const dpMin = params.dpMin ? Number(params.dpMin) : undefined;
  const dpMax = params.dpMax ? Number(params.dpMax) : undefined;

  const supabase = await createClient();

  const [
    { data: factions },
    { data: dispositions },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("factions").select("*").order("name"),
    supabase.from("dispositions").select("*").order("id"),
    supabase.auth.getUser(),
  ]);

  let query = supabase.from("detachments").select("*").order("name");
  if (factionIds.length > 0) query = query.in("faction_id", factionIds);
  if (dispositionIds.length > 0) query = query.overlaps("disposition_ids", dispositionIds);
  if (tags.length > 0) query = query.contains("tags", tags);
  if (dpMin !== undefined) query = query.gte("dp_cost", dpMin);
  if (dpMax !== undefined) query = query.lte("dp_cost", dpMax);

  const { data: detachments } = await query;

  const factionNameById = new Map((factions ?? []).map((f: Faction) => [f.id, f.name]));
  const dispositionNameById = new Map((dispositions ?? []).map((d: Disposition) => [d.id, d.name]));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/detachments" />

      <main className="mx-auto flex max-w-screen-xl gap-8 px-6 py-10">
        <aside className="w-64 shrink-0">
          <Suspense fallback={null}>
            <DetachmentFilters
              factions={(factions ?? []) as Faction[]}
              dispositions={(dispositions ?? []) as Disposition[]}
            />
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0">
          <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-2xl font-bold">
            Detachments
          </h1>
          <p className="mb-6 text-sm text-gray-400">
            {(detachments ?? []).length} detachment
            {(detachments ?? []).length === 1 ? "" : "s"}
          </p>

          {!detachments || detachments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No detachments match these filters yet — try clearing filters, or
              run scripts/seed-detachments.mjs / use the admin import page.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(detachments as Detachment[]).map((d) => (
                <div key={d.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h2 className="font-medium text-white">{d.name}</h2>
                    <span className="shrink-0 text-xs text-gray-500">{d.dp_cost} DP</span>
                  </div>
                  <p className="mb-2 text-xs text-gray-500">
                    {factionNameById.get(d.faction_id) ?? "Unknown faction"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {d.disposition_ids.map((id) => (
                      <span
                        key={id}
                        className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                      >
                        {dispositionNameById.get(id) ?? "?"}
                      </span>
                    ))}
                  </div>
                  {d.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {d.tags.map((tag) => (
                        <span key={tag} className="rounded bg-gray-800/60 px-1.5 py-0.5 text-[11px] text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {d.notes && <p className="mt-2 text-xs text-gray-400">{d.notes}</p>}
                  {d.rule_text && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-gray-300">{d.rule_text}</p>
                  )}
                  {user && (
                    <Link
                      href={`/admin/detachments/${d.id}/edit`}
                      className="mt-2 inline-block text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Edit rule text
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

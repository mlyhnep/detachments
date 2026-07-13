import Link from "next/link";
import SiteNav from "./components/SiteNav";

const SECTIONS = [
  {
    href: "/detachments",
    title: "Detachment Browser",
    description: "Browse every detachment, filterable by faction, tags, and DP cost.",
  },
  {
    href: "/dispositions",
    title: "Disposition Overview",
    description: "The 5 Force Dispositions, with descriptions and list-building tips.",
  },
  {
    href: "/matchups",
    title: "Matchup Grid",
    description: "All 15 disposition pairings — missions, objectives, layout variants.",
  },
  {
    href: "/scout",
    title: "Scout",
    description: "Pick your armies and your opponent's to plan around the likely matchup.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav activePath="/" />

      <main className="mx-auto max-w-screen-lg px-6 py-12">
        <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-3xl font-bold">
          Warhammer Detachments
        </h1>
        <p className="mb-10 text-gray-400">
          Browse 11th edition detachments and scout your matchups.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-600"
            >
              <h2 className="mb-2 text-lg font-semibold text-white">{s.title}</h2>
              <p className="text-sm text-gray-400">{s.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

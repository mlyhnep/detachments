import type { Disposition, DispositionTip } from "@/lib/types";

export default function DispositionCard({
  disposition,
  tips,
}: {
  disposition: Disposition;
  tips: DispositionTip[];
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-2 text-lg font-semibold text-white">{disposition.name}</h2>
      <p className="mb-4 text-sm text-gray-400">{disposition.description}</p>
      {tips.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {tips.map((tip) => (
            <li key={tip.id} className="flex gap-2 text-sm text-gray-300">
              <span className="text-gray-600">-</span>
              <span>{tip.tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

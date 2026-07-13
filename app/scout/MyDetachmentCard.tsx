import type { Disposition } from "@/lib/types";
import type { DetachmentWithFaction } from "@/lib/types";

export default function MyDetachmentCard({
  detachment,
  dispositionNameById,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  detachment: DetachmentWithFaction;
  dispositionNameById: Map<number, Disposition["name"]>;
  isSelected: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-white bg-gray-800"
          : "border-gray-800 bg-gray-900 hover:border-gray-600"
      }`}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-medium text-white">{detachment.name}</span>
        <span className="shrink-0 text-xs text-gray-500">{detachment.dp_cost} DP</span>
      </div>
      <p className="mb-1.5 text-xs text-gray-500">{detachment.faction_name}</p>
      <div className="flex flex-wrap gap-1">
        {detachment.disposition_ids.map((id) => (
          <span key={id} className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
            {dispositionNameById.get(id) ?? "?"}
          </span>
        ))}
      </div>
    </button>
  );
}

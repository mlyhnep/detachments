"use client";

import { useState } from "react";
import Link from "next/link";
import type { DetachmentWithFaction } from "@/lib/types";

export default function ScoutedDetachmentItem({ detachment }: { detachment: DetachmentWithFaction }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="relative text-sm text-gray-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/detachments/${detachment.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white hover:underline transition-colors"
      >
        {detachment.name}
      </Link>{" "}
      <span className="text-gray-500">({detachment.faction_name})</span>

      {hovered && detachment.notes && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded border border-gray-700 bg-gray-800 p-2 text-xs text-gray-300 shadow-xl">
          {detachment.notes}
        </div>
      )}
    </li>
  );
}

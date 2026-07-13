"use client";

import { useState, useRef, useEffect } from "react";
import type { Faction } from "@/lib/types";

export default function FactionPicker({
  label,
  factions,
  selectedIds,
  onChange,
}: {
  label: string;
  factions: Faction[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(id: number) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  const summary =
    selectedIds.length === 0
      ? "None selected"
      : selectedIds
          .map((id) => factions.find((f) => f.id === id)?.name)
          .filter(Boolean)
          .join(", ");

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-xs font-medium text-gray-400">{label}</label>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-64 truncate rounded border border-gray-700 bg-gray-900 px-3 py-2 text-left text-sm text-white hover:border-gray-500"
      >
        {summary}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-64 overflow-y-auto rounded border border-gray-700 bg-gray-900 p-2 shadow-xl">
          {factions.map((f) => (
            <label
              key={f.id}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(f.id)}
                onChange={() => toggle(f.id)}
                className="accent-white"
              />
              {f.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

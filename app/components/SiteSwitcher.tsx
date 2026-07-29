"use client";

import { useEffect, useRef, useState } from "react";

const SITES = [
  { label: "Wishlist", href: "https://wishlist.mlyhne.com/" },
  { label: "Warhammer Tracker", href: "https://warhammer.mlyhne.com/" },
  { label: "Detachments", href: "https://detachments.mlyhne.com/" },
];

export default function SiteSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-[family-name:var(--font-cinzel)] text-lg font-bold tracking-tight"
      >
        {current}
        <span className="text-xs text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded border border-gray-700 bg-gray-900 py-1 shadow-lg">
          {SITES.map((site) => (
            <a
              key={site.href}
              href={site.href}
              className={`block px-3 py-2 text-sm transition-colors ${
                site.label === current
                  ? "font-semibold text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {site.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

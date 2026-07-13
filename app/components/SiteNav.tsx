import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function SiteNav({ activePath }: { activePath?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navLinks = [
    { href: "/detachments", label: "Detachments" },
    { href: "/dispositions", label: "Dispositions" },
    { href: "/matchups", label: "Matchups" },
    { href: "/scout", label: "Scout" },
  ];

  return (
    <header className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-[family-name:var(--font-cinzel)] text-lg font-bold tracking-tight">
          Detachments
        </Link>
        <nav className="flex items-center gap-4">
          {navLinks.map(({ href, label }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  isActive ? "text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="flex items-center gap-5">
          <Link href="/admin/import" className="text-sm text-gray-400 hover:text-white transition-colors">
            Admin
          </Link>
          <form action={logout}>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

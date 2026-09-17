"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAdminAuth } from "@/components/auth/AdminAuth";

const NAV_LINKS: [string, string][] = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Users"],
  ["/admin/materials", "Materials"],
  ["/admin/billing", "Billing"],
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, signOut } = useAdminAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#eae8e2] bg-[#fbf9f3]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 md:px-8">

        {/* Logo */}
        <Link
          href="/admin"
          className="shrink-0 font-bold text-[#2d6a1b]"
        >
          StudyMate Admin
        </Link>

        {/* Main Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 rounded-xl bg-[#f5f3ee] p-1 md:flex">
          {NAV_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                pathname === href
                  ? "bg-[#468432] text-white"
                  : "text-[#1b1c19] hover:bg-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right-side controls */}
        <div className="ml-auto flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-[#697064] sm:inline">
              {email}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/admin/login");
            }}
            className="rounded-full border border-[#f0d6d6] px-3 py-2 text-sm font-semibold text-[#93000a] transition hover:bg-[#fff5f5]"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

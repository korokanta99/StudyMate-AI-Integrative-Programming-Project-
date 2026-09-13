"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMockAuth } from "@/components/auth/MockAuth";

export default function Header() {
  const p = usePathname();
  const r = useRouter();
  const a = useMockAuth();
  const [open, setOpen] = useState(false);

  const accountStatus = a.pro ? "Premium" : "Free";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#eae8e2] bg-[#fbf9f3]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="font-bold text-[#2d6a1b]"
        >
          StudyMate AI
        </Link>

        {/* Main Navigation */}
        <nav className="hidden rounded-xl bg-[#f5f3ee] p-1 md:flex">
          {[
            ["/dashboard", "Dashboard"],
            ["/ask-ai", "Ask AI"],
            ["/flashcards", "Flashcards"],
          ].map(([h, l]) => (
            <Link
              key={h}
              className={`rounded-lg px-4 py-2 text-sm ${
                p === h
                  ? "bg-[#468432] text-white"
                  : ""
              }`}
              href={h}
            >
              {l}
            </Link>
          ))}
        </nav>

        {/* Profile + Account Status */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2"
            aria-label="Open profile menu"
          >
            {/* Account Status - LEFT of Avatar */}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                a.pro
                  ? "bg-[#b4f48a] text-[#215100]"
                  : "bg-[#eae8e2] text-[#41493c]"
              }`}
            >
              {accountStatus}
            </span>

            {/* User Avatar */}
            <span className="grid size-8 place-items-center rounded-full bg-[#b4f48a] text-xs font-bold text-[#215100]">
              AS
            </span>
          </button>

          {/* Profile Dropdown */}
          {open && (
            <div className="absolute right-0 top-10 w-48 rounded-xl bg-white p-2 text-sm shadow-lg">

              <Link
                className="block rounded-lg px-3 py-2 hover:bg-[#f5f3ee]"
                href="/profile"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>

              <Link
                className="block rounded-lg px-3 py-2 hover:bg-[#f5f3ee]"
                href="/materials"
                onClick={() => setOpen(false)}
              >
                Study Materials
              </Link>

              <button
                onClick={() => {
                  a.signOut();
                  setOpen(false);
                  r.push("/login");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-[#93000a]"
              >
                Log out
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
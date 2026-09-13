"use client";

import Link from "next/link";
import { useState } from "react";

import Icon from "@/components/ui/Icon";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative md:hidden">
      {/* Menu button */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-[#41493c] transition hover:bg-[#f0eee8]"
      >
        <Icon
          name="menu"
          className="size-5"
        />
      </button>

      {/* Mobile navigation */}
      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-10 z-50 w-48 rounded-xl bg-white p-2 shadow-xl"
        >
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-2 text-sm transition hover:bg-[#f5f3ee]"
          >
            Dashboard
          </Link>

          <Link
            href="/ask-ai"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-2 text-sm transition hover:bg-[#f5f3ee]"
          >
            Ask AI
          </Link>

          <Link
            href="/flashcards"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-2 text-sm transition hover:bg-[#f5f3ee]"
          >
            Flashcards
          </Link>

          <Link
            href="/materials"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-2 text-sm transition hover:bg-[#f5f3ee]"
          >
            Materials
          </Link>
        </nav>
      )}
    </div>
  );
}
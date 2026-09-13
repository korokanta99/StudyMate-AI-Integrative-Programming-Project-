"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
};

type IconName =
  | "dashboard"
  | "materials"
  | "askAi"
  | "flashcards"
  | "subscription"
  | "settings"
  | "logout";

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/materials", label: "Materials", icon: "materials" },
  { href: "/ask-ai", label: "Ask AI", icon: "askAi" },
  { href: "/flashcards", label: "Flashcards", icon: "flashcards" },
  { href: "/subscription", label: "Subscription", icon: "subscription" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function NavigationIcon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} {...common}>
      {name === "dashboard" && <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>}
      {name === "materials" && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" /></>}
      {name === "askAi" && <><path d="M12 3 14 9l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>}
      {name === "flashcards" && <><rect x="3" y="5" width="14" height="12" rx="2" /><path d="M7 19h12a2 2 0 0 0 2-2V8" /><path d="M7 9h6" /></>}
      {name === "subscription" && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h3" /></>}
      {name === "settings" && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.6 2.6-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.1h-3.68v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.6-2.6.06-.06A1.7 1.7 0 0 0 5.38 15a1.7 1.7 0 0 0-1.56-1.03h-.1v-3.68h.1A1.7 1.7 0 0 0 5.38 9.26a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.6-2.6.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.1h3.68v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.6 2.6-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.1v3.68h-.1A1.7 1.7 0 0 0 19.4 15Z" /></>}
      {name === "logout" && <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>}
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">S</span>
        <span className="text-lg font-semibold tracking-tight">StudyMate <span className="text-indigo-600">AI</span></span>
      </Link>

      <nav aria-label="Primary navigation" className="mt-10 space-y-1">
        {navigationItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              <NavigationIcon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <NavigationIcon name="logout" className="size-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}

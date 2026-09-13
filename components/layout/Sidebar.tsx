"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SVGProps } from "react";

import { useMockAuth } from "@/components/auth/MockAuth";

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
  | "subscription";

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    href: "/materials",
    label: "Materials",
    icon: "materials",
  },
  {
    href: "/ask-ai",
    label: "Ask AI",
    icon: "askAi",
  },
  {
    href: "/flashcards",
    label: "Flashcards",
    icon: "flashcards",
  },
  {
    href: "/subscription",
    label: "Subscription",
    icon: "subscription",
  },
];

export function NavigationIcon({
  name,
  ...props
}: {
  name: IconName | "logout";
} & SVGProps<SVGSVGElement>) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      {...common}
    >
      {name === "dashboard" && (
        <>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
        </>
      )}

      {name === "materials" && (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
        </>
      )}

      {name === "askAi" && (
        <>
          <path d="M12 3 14 9l6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
        </>
      )}

      {name === "flashcards" && (
        <>
          <rect
            x="3"
            y="5"
            width="14"
            height="12"
            rx="2"
          />
          <path d="M7 19h12a2 2 0 0 0 2-2V8" />
          <path d="M7 9h6" />
        </>
      )}

      {name === "subscription" && (
        <>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </>
      )}

      {name === "logout" && (
        <>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
        </>
      )}
    </svg>
  );
}

function isActivePath(
  pathname: string,
  href: string
) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useMockAuth();

  function handleLogout() {
    signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#eae8e2] bg-[#fbf9f3] px-4 py-5 lg:flex">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-[#1b1c19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#468432]"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-[#b4f48a] text-lg font-bold text-[#215100]">
          S
        </span>

        <span className="text-lg font-semibold tracking-tight">
          StudyMate{" "}
          <span className="text-[#2d6a1b]">
            AI
          </span>
        </span>
      </Link>

      {/* Primary navigation */}
      <nav
        aria-label="Primary navigation"
        className="mt-10 space-y-1"
      >
        {navigationItems.map((item) => {
          const active = isActivePath(
            pathname,
            item.href
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#468432] ${
                active
                  ? "bg-[#468432] text-white"
                  : "text-[#41493c] hover:bg-[#f0eee8] hover:text-[#1b1c19]"
              }`}
            >
              <NavigationIcon
                name={item.icon}
                className="size-5"
              />

              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-[#eae8e2] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#93000a] transition-colors hover:bg-[#ffdad6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93000a]"
        >
          <NavigationIcon
            name="logout"
            className="size-5"
          />

          Log out
        </button>
      </div>
    </aside>
  );
}
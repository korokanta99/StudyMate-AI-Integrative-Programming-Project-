"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { useMockAuth } from "@/components/auth/MockAuth";

type Material = {
  id: string;
  fileName?: string;
  name?: string;
  title?: string;
};

type SubscriptionData = {
  pro?: boolean;
  status?: string;
  plan?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

const API_URL =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useMockAuth();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);

  const [checkingSubscription, setCheckingSubscription] =
    useState(true);

  const searchRef = useRef<HTMLInputElement>(null);

  // Same initials logic as ProfileView
  const initials = auth.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Real subscription state
  const isPro =
    subscription?.pro === true ||
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  const accountStatus = isPro
    ? "Premium"
    : "Free";

  // Load real subscription
  useEffect(() => {
    async function loadSubscription() {
      try {
        setCheckingSubscription(true);

        const session =
          await fetchAuthSession();

        const token =
          session.tokens?.idToken?.toString();

        if (!token) {
          setSubscription(null);
          return;
        }

        const response = await fetch(
          `${API_URL}/subscription`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setSubscription(null);
          return;
        }

        const data =
          await response.json();

        console.log(
          "HEADER SUBSCRIPTION RESPONSE:",
          response.status,
          JSON.stringify(data, null, 2)
        );

        const subscriptionData =
          data?.subscription &&
          typeof data.subscription === "object"
            ? data.subscription
            : data;

        setSubscription(subscriptionData);
      } catch (error) {
        console.error(
          "Failed to load subscription for header:",
          error
        );

        setSubscription(null);
      } finally {
        setCheckingSubscription(false);
      }
    }

    loadSubscription();
  }, []);

  // Load real uploaded materials for search
  useEffect(() => {
    async function loadMaterials() {
      try {
        const token =
          localStorage.getItem(
            "studymate_access_token"
          );

        if (!token) return;

        const response = await fetch(
          `${API_URL}/materials`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data =
          await response.json();

        setMaterials(
          Array.isArray(data)
            ? data
            : data.materials ?? []
        );
      } catch (error) {
        console.error(
          "Failed to load materials for search:",
          error
        );
      }
    }

    loadMaterials();
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  const filteredMaterials =
    materials.filter((material) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return false;

      const name =
        material.fileName ||
        material.name ||
        material.title ||
        "";

      return name
        .toLowerCase()
        .includes(query);
    });

  function openSearch() {
    setSearchOpen(true);
    setOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearch("");
  }

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query =
      search.trim();

    if (!query) return;

    router.push(
      `/materials?search=${encodeURIComponent(query)}`
    );

    closeSearch();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#eae8e2] bg-[#fbf9f3]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 md:px-8">
        {/* Free / Premium */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            checkingSubscription
              ? "bg-[#eae8e2] text-[#717a6b]"
              : isPro
                ? "bg-[#b4f48a] text-[#215100]"
                : "bg-[#eae8e2] text-[#41493c]"
          }`}
        >
          {checkingSubscription
            ? "Checking..."
            : accountStatus}
        </span>

        {/* Logo */}
        <Link
          href="/dashboard"
          className="shrink-0 font-bold text-[#2d6a1b]"
        >
          StudyMate AI
        </Link>

        {/* Main Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 rounded-xl bg-[#f5f3ee] p-1 md:flex">
          {[
            ["/dashboard", "Dashboard"],
            ["/ask-ai", "Ask AI"],
            ["/flashcards", "Flashcards"],
          ].map(([href, label]) => (
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
          {/* Streak */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#eae8e2] px-3 py-2 text-sm font-semibold text-[#717a6b]">
            <span className="text-base">
              🔥
            </span>

            <span>
              0d streak
            </span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-full text-[#41493c] transition hover:bg-[#f5f3ee]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5"
            >
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpen(!open)
              }
              className="grid size-9 place-items-center rounded-full bg-[#b4f48a] text-xs font-bold text-[#215100]"
              aria-label="Open profile menu"
            >
              {initials}
            </button>

            {open && (
              <div className="absolute right-0 top-11 w-48 rounded-xl bg-white p-2 text-sm shadow-lg">
                <Link
                  href="/profile"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="block rounded-lg px-3 py-2 hover:bg-[#f5f3ee]"
                >
                  Profile
                </Link>

                <Link
                  href="/materials"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="block rounded-lg px-3 py-2 hover:bg-[#f5f3ee]"
                >
                  Study Materials
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    auth.signOut();
                    setOpen(false);
                    router.push("/login");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-[#93000a]"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
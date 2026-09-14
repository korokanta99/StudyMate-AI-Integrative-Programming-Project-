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

type Notification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
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

  const [streak, setStreak] = useState(0);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // Initials
  const initials = auth.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Subscription
  const isPro =
    subscription?.pro === true ||
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  const accountStatus = isPro
    ? "Premium"
    : "Free";

  // Load subscription
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

  // Load materials
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

  // Load streak
  useEffect(() => {
    async function loadStreak() {
      try {
        const session =
          await fetchAuthSession();

        const token =
          session.tokens?.idToken?.toString();

        if (!token) return;

        const response = await fetch(
          `${API_URL}/streak`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data =
          await response.json();

        setStreak(
          Number(data?.streak ?? 0)
        );
      } catch (error) {
        console.error(
          "Failed to load streak:",
          error
        );
      }
    }

    loadStreak();
  }, []);

  // Load notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const session =
          await fetchAuthSession();

        const token =
          session.tokens?.idToken?.toString();

        if (!token) return;

        const response = await fetch(
          `${API_URL}/notifications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data =
          await response.json();

        setNotifications(
          Array.isArray(data?.notifications)
            ? data.notifications
            : []
        );

        setUnreadCount(
          Number(data?.unreadCount ?? 0)
        );
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      }
    }

    loadNotifications();
  }, []);

  // Focus search
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
    setNotificationsOpen(false);
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

  async function markNotificationAsRead(
    notificationId: string
  ) {
    try {
      const session =
        await fetchAuthSession();

      const token =
        session.tokens?.idToken?.toString();

      if (!token) return;

      const response = await fetch(
        `${API_URL}/notifications/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId,
          }),
        }
      );

      if (!response.ok) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  }

  function toggleNotifications() {
    setNotificationsOpen(
      (current) => !current
    );
    setOpen(false);
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
              {streak}d streak
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
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

              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-[#468432] px-1 text-[10px] font-bold leading-4 text-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl bg-white shadow-lg">

                <div className="border-b border-[#eae8e2] px-4 py-3">
                  <p className="text-sm font-semibold text-[#1b1c19]">
                    Notifications
                  </p>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[#717a6b]">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(
                      (notification, index) => (
                        <button
                          key={`${notification.id ?? "notification"}-${index}`}
                          type="button"
                          onClick={() =>
                            !notification.read &&
                            markNotificationAsRead(
                              notification.id
                            )
                          }
                          className={`w-full border-b border-[#f0eee9] px-4 py-3 text-left transition hover:bg-[#f8f7f3] ${
                            notification.read
                              ? "bg-white"
                              : "bg-[#f5f9f1]"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.read && (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#468432]" />
                            )}

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1b1c19]">
                                {notification.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#717a6b]">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
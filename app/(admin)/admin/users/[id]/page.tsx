"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { adminFetch } from "@/components/auth/AdminAuth";

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  status?: string;
  createdAt?: string;
};

type ActivityEntry = {
  id?: string;
  type?: string;
  description?: string;
  createdAt?: string;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    try {
      setLoading(true);
      setError("");

      const response = await adminFetch(
        `/admin/users/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load user (${response.status}).`
        );
      }

      const data = await response.json();

      setUser(data?.user ?? data);
      setActivity(
        Array.isArray(data?.activity) ? data.activity : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load user."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus() {
    if (!user) return;

    const nextStatus =
      user.status === "disabled" ? "active" : "disabled";

    try {
      setUpdating(true);

      const response = await adminFetch(
        `/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update user status (${response.status}).`
        );
      }

      setUser({ ...user, status: nextStatus });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status."
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        href="/admin/users"
        className="text-sm font-semibold text-[#468432] hover:underline"
      >
        ← Back to Users
      </Link>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-[#e5e1d7] bg-white px-6 py-10 text-center text-sm text-[#697064] shadow-sm">
          Loading user…
        </div>
      ) : !user ? (
        <div className="mt-6 rounded-2xl border border-[#e5e1d7] bg-white px-6 py-10 text-center text-sm text-[#697064] shadow-sm">
          User not found.
        </div>
      ) : (
        <>
          {/* Profile card */}
          <section className="mt-6 rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#263021]">
                  {user.name || user.username || "Unnamed user"}
                </h1>

                <p className="mt-1 text-sm text-[#697064]">
                  {user.email || "No email on file"}
                </p>

                {user.username && (
                  <p className="mt-1 text-sm text-[#697064]">
                    @{user.username}
                  </p>
                )}

                <p className="mt-1 text-xs text-[#9aa095]">
                  Joined{" "}
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString()
                    : "unknown date"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.status === "disabled"
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : "bg-[#eaf3e6] text-[#215100]"
                  }`}
                >
                  {user.status === "disabled"
                    ? "Disabled"
                    : "Active"}
                </span>

                <button
                  type="button"
                  disabled={updating}
                  onClick={toggleStatus}
                  className="rounded-lg border border-[#dfe8d9] px-3 py-1.5 text-xs font-semibold text-[#468432] transition hover:bg-[#f5f9f1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {user.status === "disabled"
                    ? "Enable account"
                    : "Disable account"}
                </button>
              </div>
            </div>
          </section>

          {/* Activity */}
          <section className="mt-6 rounded-2xl border border-[#e5e1d7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#263021]">
              Activity
            </h2>

            {activity.length === 0 ? (
              <p className="mt-3 text-sm text-[#697064]">
                No recorded activity for this user.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {activity.map((entry, index) => (
                  <li
                    key={entry.id ?? index}
                    className="border-b border-[#f0eee9] pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-medium text-[#263021]">
                      {entry.type || "Activity"}
                    </p>

                    {entry.description && (
                      <p className="mt-0.5 text-sm text-[#697064]">
                        {entry.description}
                      </p>
                    )}

                    {entry.createdAt && (
                      <p className="mt-0.5 text-xs text-[#9aa095]">
                        {new Date(
                          entry.createdAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

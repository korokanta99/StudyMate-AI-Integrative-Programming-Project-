"use client";

import Link from "next/link";
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await adminFetch("/admin/users");

      if (!response.ok) {
        throw new Error(
          `Failed to load users (${response.status}).`
        );
      }

      const data = await response.json();

      setUsers(
        Array.isArray(data) ? data : data.users ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(user: AdminUser) {
    const nextStatus =
      user.status === "disabled" ? "active" : "disabled";

    try {
      setUpdatingId(user.id);

      const response = await adminFetch(
        `/admin/users/${user.id}/status`,
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

      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id
            ? { ...entry, status: nextStatus }
            : entry
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#2d6a1b]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#263021]">
          Users
        </h1>

        <p className="mt-2 text-[#697064]">
          All registered StudyMate accounts.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e5e1d7] bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-[#697064]">
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#697064]">
            No users found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e1d7] bg-[#f5f3ee] text-xs uppercase tracking-wide text-[#697064]">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#f0eee9] last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-[#263021]">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:underline"
                    >
                      {user.name || user.username || "—"}
                    </Link>
                  </td>

                  <td className="px-5 py-3 text-[#41493c]">
                    {user.email || "—"}
                  </td>

                  <td className="px-5 py-3">
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
                  </td>

                  <td className="px-5 py-3 text-[#697064]">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      disabled={updatingId === user.id}
                      onClick={() => toggleStatus(user)}
                      className="rounded-lg border border-[#dfe8d9] px-3 py-1.5 text-xs font-semibold text-[#468432] transition hover:bg-[#f5f9f1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {user.status === "disabled"
                        ? "Enable"
                        : "Disable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

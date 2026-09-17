"use client";

import { useEffect, useState } from "react";

import { adminFetch } from "@/components/auth/AdminAuth";

type AdminSubscription = {
  id: string;
  userEmail?: string;
  userName?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export default function AdminBillingPage() {
  const [subscriptions, setSubscriptions] = useState<
    AdminSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setLoading(true);
        setError("");

        const response = await adminFetch(
          "/admin/subscriptions"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load subscriptions (${response.status}).`
          );
        }

        const data = await response.json();

        setSubscriptions(
          Array.isArray(data)
            ? data
            : data.subscriptions ?? []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subscriptions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#2d6a1b]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#263021]">
          Billing
        </h1>

        <p className="mt-2 text-[#697064]">
          Subscription and billing status across users.
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
            Loading subscriptions…
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#697064]">
            No subscriptions found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e1d7] bg-[#f5f3ee] text-xs uppercase tracking-wide text-[#697064]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Renews / Ends</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="border-b border-[#f0eee9] last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-[#263021]">
                    {subscription.userName ||
                      subscription.userEmail ||
                      "—"}
                  </td>

                  <td className="px-5 py-3 text-[#41493c]">
                    {subscription.plan || "—"}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        subscription.status === "active" ||
                        subscription.status === "trialing"
                          ? "bg-[#eaf3e6] text-[#215100]"
                          : "bg-[#eae8e2] text-[#41493c]"
                      }`}
                    >
                      {subscription.status || "unknown"}
                    </span>

                    {subscription.cancelAtPeriodEnd && (
                      <span className="ml-2 text-xs text-[#93000a]">
                        Cancels at period end
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-[#697064]">
                    {subscription.currentPeriodEnd
                      ? new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()
                      : "—"}
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

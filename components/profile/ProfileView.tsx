"use client";

import {
  fetchAuthSession,
  getCurrentUser,
  updatePassword,
  updateUserAttributes,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useMockAuth } from "@/components/auth/MockAuth";

const API_URL =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type SubscriptionData = {
  pro?: boolean;
  status?: string;
  plan?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export default function ProfileView() {
  const router = useRouter();
  const auth = useMockAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(auth.name);
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  const [savingName, setSavingName] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [subscription, setSubscription] =
    useState<SubscriptionData | null>(null);

  const [checkingSubscription, setCheckingSubscription] =
    useState(true);

  // Load Cognito username
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();

        setUsername(user.username);
      } catch (error) {
        console.error(
          "Failed to load Cognito username:",
          error
        );
      }
    }

    loadUser();
  }, []);

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

        const data =
          await response.json();

        console.log(
          "PROFILE SUBSCRIPTION RESPONSE:",
          response.status,
          JSON.stringify(data, null, 2)
        );

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to check subscription."
          );
        }

        const subscriptionData =
          data?.subscription &&
          typeof data.subscription === "object"
            ? data.subscription
            : data;

        setSubscription(subscriptionData);
      } catch (error) {
        console.error(
          "Profile subscription check failed:",
          error
        );

        setSubscription(null);
      } finally {
        setCheckingSubscription(false);
      }
    }

    loadSubscription();
  }, []);

  // Get initials
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Save full name
  async function saveProfile(
    event?: React.FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setMessageType("error");
      setMessage(
        "Please enter your full name."
      );
      return;
    }

    try {
      setSavingName(true);
      setMessage("");

      await updateUserAttributes({
        userAttributes: {
          name: trimmedName,
        },
      });

      auth.updateProfile(
        trimmedName,
        ""
      );

      setName(trimmedName);
      setEditing(false);

      setMessageType("success");
      setMessage(
        "Full name updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update full name:",
        error
      );

      setMessageType("error");

      if (
        error instanceof Error &&
        error.message
      ) {
        setMessage(error.message);
      } else {
        setMessage(
          "Unable to update your full name."
        );
      }
    } finally {
      setSavingName(false);
    }
  }

  // Change password
  async function changePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setMessageType("error");
      setMessage(
        "Complete all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setMessageType("error");
      setMessage(
        "Your new password needs at least 8 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setMessageType("error");
      setMessage(
        "New passwords do not match."
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setMessageType("error");
      setMessage(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);
      setMessage("");

      await updatePassword({
        oldPassword:
          currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setMessageType("success");
      setMessage(
        "Password updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to change password:",
        error
      );

      setMessageType("error");

      if (
        error instanceof Error &&
        error.message
      ) {
        setMessage(error.message);
      } else {
        setMessage(
          "Unable to update your password."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  }

  // Log out
  function logout() {
    auth.signOut();
    router.push("/login");
  }

  // Open subscription
  function openSubscription() {
    router.push("/subscription");
  }

  // Determine subscription state
  const isPro =
    subscription?.pro === true ||
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  const subscriptionLabel =
    isPro
      ? "Premium"
      : "Free";

  const subscriptionStatus =
    subscription?.status ===
    "trialing"
      ? "Trialing"
      : subscription?.status ===
          "active"
        ? "Active"
        : "Free";

  return (
    <div className="mx-auto max-w-5xl pb-10">
      {/* Profile header */}
      <section className="rounded-2xl border border-[#eae8e2] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-[#b4f48a] text-3xl font-bold text-[#215100]">
            {initials}
          </div>

          {/* User details */}
          <div className="min-w-0 flex-1">
            <h1 className="text-[30px] font-bold tracking-tight text-[#1b1c19]">
              {name}
            </h1>

            <p className="mt-1 text-base text-[#717a6b]">
              {auth.email}
            </p>

            <span className="mt-3 inline-block rounded-full bg-[#b4f48a]/60 px-3 py-1 text-[11px] font-bold text-[#215100]">
              STUDENT ACCOUNT
            </span>
          </div>

          {/* Edit profile */}
          <button
            type="button"
            onClick={() => {
              setEditing(!editing);
              setName(auth.name);
              setMessage("");
            }}
            className="shrink-0 rounded-xl bg-[#f0eee8] px-5 py-2.5 text-sm font-semibold text-[#1b1c19] transition hover:bg-[#eae8e2]"
          >
            {editing
              ? "Cancel"
              : "Edit profile"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            role="status"
            className={`mt-6 rounded-xl p-3 text-sm ${
              messageType === "success"
                ? "bg-[#b4f48a]/40 text-[#215100]"
                : "bg-[#ffdad6] text-[#93000a]"
            }`}
          >
            {message}
          </div>
        )}
      </section>

      {/* Account + Subscription */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Account information */}
        <section className="rounded-2xl border border-[#eae8e2] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1b1c19]">
            Account information
          </h2>

          <p className="mt-1 text-sm text-[#717a6b]">
            Manage your personal information.
          </p>

          <div className="mt-5 rounded-2xl border border-[#eae8e2] bg-[#fbfaf7] px-5">
            {/* Full name */}
            <div className="py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1b1c19]">
                    Full name
                  </p>

                  {editing ? (
                    <form
                      onSubmit={saveProfile}
                      className="mt-2 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        value={name}
                        onChange={(event) =>
                          setName(
                            event.target.value
                          )
                        }
                        disabled={savingName}
                        autoFocus
                        className="min-w-0 flex-1 rounded-xl border border-[#d9d6ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#468432] focus:ring-2 focus:ring-[#468432]/20 disabled:opacity-60"
                      />

                      <button
                        type="submit"
                        disabled={savingName}
                        className="rounded-xl bg-[#468432] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d6a1b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingName
                          ? "Saving..."
                          : "Save"}
                      </button>
                    </form>
                  ) : (
                    <p className="mt-1 text-base text-[#41493c]">
                      {name}
                    </p>
                  )}
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setName(auth.name);
                      setMessage("");
                    }}
                    className="rounded-xl bg-[#f0eee8] px-4 py-2 text-sm font-semibold text-[#1b1c19] transition hover:bg-[#eae8e2]"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-[#eae8e2]" />

            {/* Username */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1b1c19]">
                  Username
                </p>

                <p className="mt-1 break-all text-base text-[#41493c]">
                  {username || "Loading..."}
                </p>
              </div>

              <div className="shrink-0 text-[#9a9a94]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </div>
            </div>

            <div className="border-t border-[#eae8e2]" />

            {/* Email */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1b1c19]">
                  Email
                </p>

                <p className="mt-1 break-all text-base text-[#41493c]">
                  {auth.email}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-[#9a9a94]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-5"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <span className="hidden text-xs sm:inline">
                  Cannot be changed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="rounded-2xl border border-[#eae8e2] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1b1c19]">
                Subscription
              </h2>

              <p className="mt-1 text-sm text-[#717a6b]">
                Manage your plan and billing.
              </p>
            </div>

            {checkingSubscription ? (
              <span className="rounded-full bg-[#eae8e2] px-3 py-1.5 text-[11px] font-bold text-[#717a6b]">
                Checking...
              </span>
            ) : (
              <span
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${
                  isPro
                    ? "bg-[#b4f48a] text-[#215100]"
                    : "bg-[#eae8e2] text-[#41493c]"
                }`}
              >
                {subscriptionLabel}
              </span>
            )}
          </div>

          {checkingSubscription ? (
            <div className="mt-5 rounded-2xl bg-[#f5f3ee] p-5">
              <div className="h-5 w-32 animate-pulse rounded bg-[#eae8e2]" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#eae8e2]" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#eae8e2]" />
            </div>
          ) : isPro ? (
            <>
              <div className="mt-5 rounded-2xl bg-[#f4faee] p-5">
                <div className="flex items-start gap-4">
                  {/* Pro star */}
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#d9f6bd]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6 text-[#215100]"
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-[#1b1c19]">
                      Pro{" "}
                      {subscription?.status ===
                      "trialing"
                        ? "Trial"
                        : "Membership"}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-[#717a6b]">
                      {subscription?.cancelAtPeriodEnd
                        ? "Your membership is scheduled to end at the end of your current billing period."
                        : subscription?.status ===
                            "trialing"
                          ? "Your trial is active. You have access to all Pro study tools."
                          : "Your Pro study tools are active."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-[#dfe8d7]" />

                <div className="divide-y divide-[#dfe8d7]">
                  <div className="flex justify-between gap-4 py-3 text-sm">
                    <span className="text-[#717a6b]">
                      Status
                    </span>

                    <span className="font-semibold capitalize text-[#1b1c19]">
                      {subscriptionStatus}
                    </span>
                  </div>

                  {subscription?.plan && (
                    <div className="flex justify-between gap-4 py-3 text-sm">
                      <span className="text-[#717a6b]">
                        Plan
                      </span>

                      <span className="font-semibold capitalize text-[#1b1c19]">
                        {subscription.plan}
                      </span>
                    </div>
                  )}

                  {subscription?.trialEnd && (
                    <div className="flex justify-between gap-4 py-3 text-sm">
                      <span className="text-[#717a6b]">
                        Trial ends
                      </span>

                      <span className="font-semibold text-[#1b1c19]">
                        {new Date(
                          subscription.trialEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {subscription?.currentPeriodEnd && (
                    <div className="flex justify-between gap-4 py-3 text-sm">
                      <span className="text-[#717a6b]">
                        {subscription?.cancelAtPeriodEnd
                          ? "Access ends"
                          : "Period ends"}
                      </span>

                      <span className="font-semibold text-[#1b1c19]">
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {subscription?.cancelAtPeriodEnd && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-semibold">
                    ⚠️ Cancellation scheduled
                  </p>

                  <p className="mt-1 text-xs">
                    Your Pro access remains active
                    until the period end date.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={openSubscription}
                className="mt-4 w-full rounded-xl bg-[#468432] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d6a1b]"
              >
                Manage membership
              </button>
            </>
          ) : (
            <>
              <div className="mt-5 rounded-2xl bg-[#f5f3ee] p-5">
                <h3 className="font-bold text-[#1b1c19]">
                  Free plan
                </h3>

                <p className="mt-1 text-sm leading-5 text-[#717a6b]">
                  You are using the free study
                  workspace. Upgrade when you're ready
                  for Pro features.
                </p>
              </div>

              <button
                type="button"
                onClick={openSubscription}
                className="mt-4 w-full rounded-xl bg-[#468432] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2d6a1b]"
              >
                Explore Pro
              </button>
            </>
          )}
        </section>
      </div>

      {/* Password & security */}
      <section className="mt-6 rounded-2xl border border-[#eae8e2] bg-white p-6 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold text-[#1b1c19]">
          Password & security
        </h2>

        <p className="mt-1 text-sm text-[#717a6b]">
          Change your password to keep your account secure.
        </p>

        <form
          onSubmit={changePassword}
          className="mt-6 space-y-4"
        >
          {/* Current password */}
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-semibold text-[#1b1c19]"
            >
              Current password
            </label>

            <div className="relative">
              <input
                id="current-password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                disabled={changingPassword}
                className="w-full rounded-xl border border-[#d9d6ce] bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#468432] focus:ring-2 focus:ring-[#468432]/20 disabled:opacity-60"
              />

              <button
                type="button"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
                disabled={changingPassword}
                className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#41493c] transition hover:bg-[#f5f3ee] disabled:opacity-50"
              >
                {showCurrentPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18 18 0 0 1-3.1 3.8" />
                    <path d="M6.1 6.2C3.9 8 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold text-[#1b1c19]"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="new-password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-xl border border-[#d9d6ce] bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#468432] focus:ring-2 focus:ring-[#468432]/20 disabled:opacity-60"
              />

              <button
                type="button"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                disabled={changingPassword}
                className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#41493c] transition hover:bg-[#f5f3ee] disabled:opacity-50"
              >
                {showNewPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18 18 0 0 1-3.1 3.8" />
                    <path d="M6.1 6.2C3.9 6.2 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-[#1b1c19]"
            >
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                disabled={changingPassword}
                className="w-full rounded-xl border border-[#d9d6ce] bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#468432] focus:ring-2 focus:ring-[#468432]/20 disabled:opacity-60"
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                disabled={changingPassword}
                className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#41493c] transition hover:bg-[#f5f3ee] disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18 18 0 0 1-3.1 3.8" />
                    <path d="M6.1 6.2C3.9 6.2 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.6-.3 3.7-.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Update password */}
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2d6a1b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword
              ? "Updating..."
              : "Update password"}
          </button>
        </form>
      </section>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ffdad6] px-5 py-3 text-sm font-semibold text-[#93000a] transition hover:bg-[#ffc9c4]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>

        Log out
      </button>
    </div>
  );
}
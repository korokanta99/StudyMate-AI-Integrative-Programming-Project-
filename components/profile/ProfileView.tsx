"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMockAuth } from "@/components/auth/MockAuth";

export default function ProfileView() {
  const router = useRouter();
  const auth = useMockAuth();

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(auth.name);
  const [studentInfo, setStudentInfo] = useState(
    auth.studentInfo
  );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  // Get the user's initials
  const initials = auth.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Save profile changes
  function saveProfile(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    auth.updateProfile(
      name.trim(),
      studentInfo.trim()
    );

    setEditing(false);
    setMessage("Profile updated successfully.");
  }

  // Change password
  function changePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setMessage("Complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage(
        "Your new password needs at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage(
      "Password updated in this mock session."
    );
  }

  // Log the user out
  function logout() {
    auth.signOut();
    router.push("/login");
  }

  // Open subscription page
  function openSubscription() {
    router.push("/subscription");
  }

  // Determine subscription label
  const subscriptionLabel = auth.pro
    ? "Premium"
    : "Free";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Profile header */}
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <span className="grid size-20 place-items-center rounded-2xl bg-[#b4f48a] text-2xl font-bold text-[#215100]">
              {initials}
            </span>

            <div>
              <span className="rounded-full bg-[#b4f48a]/50 px-2 py-1 text-[11px] font-bold text-[#215100]">
                STUDENT ACCOUNT
              </span>

              <h1 className="mt-2 text-[32px] font-bold tracking-tight">
                {auth.name}
              </h1>

              <p className="text-sm text-[#41493c]">
                {auth.email}
              </p>
            </div>
          </div>

          {/* Edit profile button */}
          <button
            type="button"
            onClick={() => {
              setEditing(!editing);
              setMessage("");
            }}
            className="rounded-xl bg-[#f0eee8] px-4 py-2 text-sm font-semibold text-[#1b1c19] transition hover:bg-[#eae8e2]"
          >
            {editing
              ? "Cancel editing"
              : "Edit Profile"}
          </button>
        </div>

        {/* Status message */}
        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-[#b4f48a]/40 p-3 text-sm text-[#215100]"
          >
            {message}
          </p>
        )}
      </section>

      {/* Account information and subscription */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Student information */}
        <section className="rounded-2xl bg-[#f5f3ee] p-6">
          <h2 className="text-lg font-semibold">
            Student & account information
          </h2>

          {editing ? (
            <form
              onSubmit={saveProfile}
              className="mt-5 space-y-4"
            >
              {/* Full name */}
              <label className="block text-sm font-semibold">
                Full name

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl bg-white p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                />
              </label>

              {/* Student information */}
              <label className="block text-sm font-semibold">
                Student information

                <input
                  value={studentInfo}
                  onChange={(event) =>
                    setStudentInfo(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl bg-white p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
                />
              </label>

              {/* Save */}
              <button
                type="submit"
                className="rounded-xl bg-[#468432] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d6a1b]"
              >
                Save profile
              </button>
            </form>
          ) : (
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[#717a6b]">
                  Full name
                </dt>

                <dd className="mt-1 font-semibold">
                  {auth.name}
                </dd>
              </div>

              <div>
                <dt className="text-[#717a6b]">
                  Email
                </dt>

                <dd className="mt-1 font-semibold">
                  {auth.email}
                </dd>
              </div>

              <div>
                <dt className="text-[#717a6b]">
                  Student information
                </dt>

                <dd className="mt-1 font-semibold">
                  {auth.studentInfo}
                </dd>
              </div>
            </dl>
          )}
        </section>

        {/* Subscription */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Subscription status
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                auth.pro
                  ? "bg-[#b4f48a] text-[#215100]"
                  : "bg-[#eae8e2] text-[#41493c]"
              }`}
            >
              {subscriptionLabel}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#41493c]">
            {auth.pro
              ? "Your Pro study tools are active."
              : "You are using the free study workspace. Upgrade when you are ready for Pro features."}
          </p>

          <button
            type="button"
            onClick={openSubscription}
            className="mt-5 rounded-xl bg-[#468432] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d6a1b]"
          >
            {auth.pro
              ? "View membership"
              : "Explore Pro"}
          </button>
        </section>
      </div>

      {/* Change password */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Change password
        </h2>

        <form
          onSubmit={changePassword}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          <input
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            type="password"
            placeholder="Current password"
            autoComplete="current-password"
            className="rounded-xl bg-[#f5f3ee] p-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
          />

          <input
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            className="rounded-xl bg-[#f5f3ee] p-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
          />

          <input
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="rounded-xl bg-[#f5f3ee] p-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
          />

          <button
            type="submit"
            className="w-fit rounded-xl bg-[#f0eee8] px-4 py-2 text-sm font-semibold transition hover:bg-[#eae8e2]"
          >
            Update password
          </button>
        </form>
      </section>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="mt-6 rounded-xl bg-[#ffdad6] px-4 py-2 text-sm font-semibold text-[#93000a] transition hover:bg-[#ffc9c4]"
      >
        Log out
      </button>
    </div>
  );
}
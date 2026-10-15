"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAdminAuth } from "@/components/auth/AdminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email.trim(), password);

      const next = searchParams.get("next") || "/admin";
      router.push(next);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf9f3] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-[#1b1c19] shadow-xl"
      >
        {/* Branding */}
        <div className="text-3xl font-bold text-[#2d6a1b]">
          StudyMate{" "}
          <small className="rounded-full bg-[#468432] px-2 py-1 text-xs text-white">
            Admin
          </small>
        </div>

        <p className="mt-2 text-sm text-[#41493c]">
          Sign in to the admin panel
        </p>

        {/* Form fields */}
        <div className="mt-6 space-y-4 text-left">
          <label className="block text-sm font-semibold">
            Email

            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@studymate.ai"
              autoComplete="username"
              className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password

            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
            />
          </label>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2d6a1b] py-3 font-semibold text-white transition hover:bg-[#468432] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait…" : "Log in →"}
          </button>
        </div>
      </form>
    </main>
  );
}

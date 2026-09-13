"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMockAuth } from "./MockAuth";

type AuthFormProps = {
  signup?: boolean;
};

export default function AuthForm({
  signup = false,
}: AuthFormProps) {
  const router = useRouter();
  const { signIn } = useMockAuth();

  const [name, setName] = useState("Candice Berdin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Signup validation
    if (signup && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (signup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Mock authentication for now.
    // This will eventually be replaced with AWS Cognito.
    setTimeout(() => {
      signIn();
      router.push("/dashboard");
    }, 400);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf9f3] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"
      >
        {/* =========================================
            BRANDING
        ========================================== */}
        <div className="text-3xl font-bold text-[#2d6a1b]">
          StudyMate{" "}
          <small className="rounded-full bg-[#468432] px-2 py-1 text-xs text-white">
            AI
          </small>
        </div>

        <p className="mt-2 text-sm text-[#41493c]">
          AI-powered study assistant & active recall
        </p>

        {/* =========================================
            LOGIN / SIGNUP TABS
        ========================================== */}
        <div className="mt-6 flex rounded-xl bg-[#f0eee8] p-1">
          <Link
            href="/login"
            className={`flex-1 rounded-lg py-2 ${
              !signup
                ? "bg-[#2d6a1b] text-white"
                : "text-[#41493c]"
            }`}
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className={`flex-1 rounded-lg py-2 ${
              signup
                ? "bg-[#2d6a1b] text-white"
                : "text-[#41493c]"
            }`}
          >
            Sign Up
          </Link>
        </div>

        {/* =========================================
            FORM FIELDS
        ========================================== */}
        <div className="mt-6 space-y-4 text-left">
          {/* Full name — signup only */}
          {signup && (
            <label className="block text-sm font-semibold">
              Full name

              <input
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
              />
            </label>
          )}

          {/* Email */}
          <label className="block text-sm font-semibold">
            Email

            <input
              required
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="candiceberdin@gmail.com"
              autoComplete="email"
              className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
            />
          </label>

          {/* Password */}
          <label className="block text-sm font-semibold">
            Password

            {!signup && (
              <Link
                href="/forgot-password"
                className="float-right text-xs text-[#2d6a1b]"
              >
                Forgot password?
              </Link>
            )}

            <span className="relative mt-2 block">
              <input
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                type={showPassword ? "text" : "password"}
                autoComplete={
                  signup ? "new-password" : "current-password"
                }
                className="w-full rounded-xl bg-[#f5f3ee] p-3 pr-16 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-3 text-xs text-[#41493c]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {/* Confirm password — signup only */}
          {signup && (
            <label className="block text-sm font-semibold">
              Confirm password

              <input
                required
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                type={
                  showPassword ? "text" : "password"
                }
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 font-normal outline-none focus:ring-2 focus:ring-[#468432]"
              />
            </label>
          )}

          {/* Remember me — login only */}
          {!signup && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4"
              />

              <span>Remember me</span>
            </label>
          )}

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
            {loading
              ? "Please wait…"
              : signup
                ? "Create account →"
                : "Log in →"}
          </button>
        </div>

        {/* =========================================
            SWITCH AUTH MODE
        ========================================== */}
        <p className="mt-5 text-sm">
          {signup
            ? "Already have an account?"
            : "Don’t have an account?"}{" "}
          <Link
            href={signup ? "/login" : "/signup"}
            className="font-semibold text-[#2d6a1b]"
          >
            {signup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </form>
    </main>
  );
}
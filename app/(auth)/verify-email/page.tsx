"use client";

import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUsername = sessionStorage.getItem(
      "studymate-signup-username"
    );

    if (!savedUsername) {
      router.replace("/signup");
      return;
    }

    setUsername(savedUsername);
  }, [router]);

  async function verifyEmail(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      await confirmSignUp({
        username,
        confirmationCode: code.trim(),
      });

      sessionStorage.removeItem(
        "studymate-signup-username"
      );

      setMessage(
        "Your email has been verified successfully."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to verify your email.";

      if (
        errorMessage.includes("CodeMismatchException")
      ) {
        setError(
          "That verification code is incorrect. Please try again."
        );
      } else if (
        errorMessage.includes("ExpiredCodeException")
      ) {
        setError(
          "That verification code has expired. Please request a new one."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await resendSignUpCode({
        username,
      });

      setMessage(
        "A new verification code has been sent to your email."
      );
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to resend the code.";

      setError(errorMessage);
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf9f3] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {/* Branding */}
        <div className="text-3xl font-bold text-[#2d6a1b]">
          StudyMate{" "}
          <small className="rounded-full bg-[#468432] px-2 py-1 text-xs text-white">
            AI
          </small>
        </div>

        <p className="mt-2 text-sm text-[#41493c]">
          AI-powered study assistant & active recall
        </p>

        {/* Verification */}
        <div className="mt-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f2e4] text-2xl">
            ✉
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#263021]">
            Verify your email
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#697064]">
            We sent a verification code to the email
            address you used to create your StudyMate AI
            account.
          </p>
        </div>

        <form
          onSubmit={verifyEmail}
          className="mt-6 space-y-4 text-left"
        >
          <label className="block text-sm font-semibold text-[#263021]">
            Verification code

            <input
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter your code"
              className="mt-2 w-full rounded-xl bg-[#f5f3ee] p-3 text-center tracking-[0.35em] outline-none focus:ring-2 focus:ring-[#468432]"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-lg bg-[#e8f2e4] p-3 text-sm text-[#2d6a1b]"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2d6a1b] py-3 font-semibold text-white transition hover:bg-[#468432] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Verifying…"
              : "Verify email →"}
          </button>
        </form>

        <button
          type="button"
          onClick={resendCode}
          disabled={resending}
          className="mt-4 text-sm font-semibold text-[#2d6a1b] disabled:opacity-60"
        >
          {resending
            ? "Sending…"
            : "Didn't receive a code? Resend"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="mt-4 block w-full text-sm text-[#697064] hover:text-[#2d6a1b]"
        >
          ← Back to sign up
        </button>
      </div>
    </main>
  );
}
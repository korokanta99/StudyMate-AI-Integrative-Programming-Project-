"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type TimeOption = {
  label: string;
  seconds: number | null;
};

const TIME_OPTIONS: TimeOption[] = [
  {
    label: "5 min",
    seconds: 5 * 60,
  },
  {
    label: "10 min",
    seconds: 10 * 60,
  },
  {
    label: "15 min",
    seconds: 15 * 60,
  },
  {
    label: "20 min",
    seconds: 20 * 60,
  },
  {
    label: "30 min",
    seconds: 30 * 60,
  },
  {
    label: "Custom",
    seconds: null,
  },
  {
    label: "No limit",
    seconds: 0,
  },
];

export default function QuizSettingsView() {
  const params = useParams();
  const router = useRouter();

  const deckId = Array.isArray(params.deckId)
    ? params.deckId[0]
    : params.deckId;

  const [selectedTime, setSelectedTime] =
    useState("10 min");

  const [customMinutes, setCustomMinutes] =
    useState("10");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function getToken() {
    const session =
      await fetchAuthSession();

    const token =
      session.tokens?.accessToken?.toString();

    if (!token) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    return token;
  }

  function getTimeLimitSeconds() {
    if (
      selectedTime === "Custom"
    ) {
      const minutes =
        Number(customMinutes);

      if (
        !Number.isFinite(minutes) ||
        minutes < 1
      ) {
        return null;
      }

      return Math.round(
        minutes * 60
      );
    }

    const option =
      TIME_OPTIONS.find(
        (item) =>
          item.label === selectedTime
      );

    return option?.seconds ?? 0;
  }

  async function handleStartQuiz() {
    try {
      setLoading(true);
      setError("");

      const timeLimitSeconds =
        getTimeLimitSeconds();

      if (
        timeLimitSeconds === null
      ) {
        setError(
          "Please enter a valid custom time."
        );
        return;
      }

      const token =
        await getToken();

      const response =
        await fetch(
          `${API_BASE}/flashcards/quiz`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              deckId,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to generate the quiz."
        );
      }

      if (!data.quiz) {
        throw new Error(
          "The quiz could not be generated."
        );
      }

      sessionStorage.setItem(
        `studymate_quiz_${deckId}`,
        JSON.stringify({
          ...data.quiz,
          timeLimitSeconds,
          startedAt: null,
        })
      );

      router.push(
        `/flashcards/${deckId}/quiz/take`
      );
    } catch (err) {
      console.error(
        "Failed to start quiz:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start the quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">

      {/* Header */}
      <div className="flex w-full">

        <Link
          href={`/flashcards/${deckId}/review`}
          className="text-sm font-semibold text-[#41493c] transition hover:text-[#2d6a1b]"
        >
          ← Back to Review
        </Link>

      </div>

      {/* Settings Card */}
      <div className="mt-12 w-full max-w-2xl">

        <div className="rounded-3xl bg-white p-8 shadow-[0_12px_40px_rgba(70,132,50,.10)] sm:p-10">

          {/* Icon */}
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf7e3] text-[#2d6a1b]">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-7"
              aria-hidden="true"
            >
              <path
                d="M9 3h6M10 3v3h4V3M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="m8 12 1.5 1.5L13 10M8 17h8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>

          {/* Heading */}
          <div className="mt-6 text-center">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2d6a1b]">
              Quiz Ready
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#242820]">
              Ready for your quiz?
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#717a6b]">
              Choose your time limit before
              starting the quiz.
            </p>

          </div>

          {/* Time Options */}
          <div className="mt-9">

            <div className="mb-4">

              <h2 className="text-sm font-bold text-[#41493c]">
                Choose your time limit
              </h2>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

              {TIME_OPTIONS.map(
                (option) => {
                  const selected =
                    selectedTime ===
                    option.label;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setSelectedTime(
                          option.label
                        );
                        setError("");
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        selected
                          ? "border-[#468432] bg-[#eaf7e3] text-[#2d6a1b] shadow-sm"
                          : "border-[#e4e2dd] bg-white text-[#41493c] hover:border-[#b7c9ad] hover:bg-[#f8f7f3]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* Custom */}
          {selectedTime ===
            "Custom" && (
            <div className="mt-5 rounded-2xl bg-[#f5f3ee] p-4">

              <label
                htmlFor="customMinutes"
                className="block text-xs font-bold uppercase tracking-wider text-[#717a6b]"
              >
                Custom time
              </label>

              <div className="mt-2 flex items-center gap-3">

                <input
                  id="customMinutes"
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(event) => {
                    setCustomMinutes(
                      event.target.value
                    );
                    setError("");
                  }}
                  className="w-full rounded-xl border border-[#dedbd3] bg-white px-4 py-3 text-sm font-semibold text-[#242820] outline-none transition focus:border-[#468432] focus:ring-2 focus:ring-[#468432]/10"
                />

                <span className="text-sm font-semibold text-[#717a6b]">
                  minutes
                </span>

              </div>

            </div>
          )}

          {/* Selected */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f0eee8] px-4 py-3">

            <span className="text-sm text-[#41493c]">
              Time limit
            </span>

            <span className="text-sm font-bold text-[#2d6a1b]">
              {selectedTime ===
              "Custom"
                ? `${customMinutes || "0"} min`
                : selectedTime}
            </span>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-medium text-[#a52a1f]">
              {error}
            </div>
          )}

          {/* Start */}
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#468432] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#3d752c] disabled:cursor-wait disabled:opacity-60"
          >
            {loading
              ? "Generating Quiz..."
              : "Start Quiz →"}
          </button>

          {/* Note */}
          <p className="mt-4 text-center text-xs leading-5 text-[#717a6b]">
            The quiz is generated from the
            flashcards in this deck.
          </p>

        </div>

      </div>

    </div>
  );
}
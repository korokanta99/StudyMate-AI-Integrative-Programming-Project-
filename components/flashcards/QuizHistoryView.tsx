"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type QuizAttempt = {
  attemptId: string;
  quizId: string;
  deckId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
  timedOut?: boolean;
  wrongTopics?: string[];
  wrongQuestions?: string[];
  completedAt?: string;
  createdAt?: string;
};

type HistoryResponse = {
  success: boolean;
  deck?: {
    deckId: string;
    title?: string;
    materialName?: string;
  };
  attempts?: QuizAttempt[];
  message?: string;
};

export default function QuizHistoryView() {
  const params = useParams();
  const router = useRouter();

  const deckId = params?.deckId as string;

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [deckTitle, setDeckTitle] = useState("Quiz History");
  const [materialName, setMaterialName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deckId) return;

    loadHistory();
  }, [deckId]);

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const session = await fetchAuthSession();

      const token = session.tokens?.idToken?.toString();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/flashcards/${deckId}/quiz/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: HistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load quiz history.");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load quiz history.");
      }

      setAttempts(data.attempts || []);

      if (data.deck?.title) {
        setDeckTitle(data.deck.title);
      }

      if (data.deck?.materialName) {
        setMaterialName(data.deck.materialName);
      }
    } catch (err) {
      console.error("Quiz history error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while loading your quiz history.");
      }
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatTime(seconds?: number) {
    if (seconds === undefined || seconds === null) {
      return "—";
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getStatus(attempt: QuizAttempt) {
    if (attempt.timedOut) {
      return {
        label: "Timed Out",
        className:
          "bg-orange-50 text-orange-700 border border-orange-200",
      };
    }

    if (attempt.percentage === 100) {
      return {
        label: "Perfect",
        className:
          "bg-purple-50 text-purple-700 border border-purple-200",
      };
    }

    if (attempt.percentage >= 70) {
      return {
        label: "Passed",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    }

    return {
      label: "Keep Practicing",
      className: "bg-red-50 text-red-700 border border-red-200",
    };
  }

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.percentage))
      : 0;

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (total, attempt) => total + attempt.percentage,
            0
          ) / attempts.length
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-3 h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/flashcards/${deckId}/quiz`}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to Quiz
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Quiz History
          </h1>

          <p className="mt-2 text-gray-500">
            {deckTitle}
            {materialName ? ` • ${materialName}` : ""}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load quiz history
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              onClick={loadHistory}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Attempts
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {attempts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Best Score
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {attempts.length > 0 ? `${bestScore}%` : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Average Score
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {attempts.length > 0 ? `${averageScore}%` : "—"}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {!error && attempts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              📝
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No quiz attempts yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Complete a quiz to see your scores, progress, and previous
              attempts here.
            </p>

            <Link
              href={`/flashcards/${deckId}/quiz`}
              className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Take Quiz
            </Link>
          </div>
        )}

        {/* History List */}
        {!error && attempts.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Previous Attempts
              </h2>

              <button
                onClick={loadHistory}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              {attempts.map((attempt, index) => {
                const status = getStatus(attempt);

                return (
                  <div
                    key={attempt.attemptId}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      {/* Left */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                          #{attempts.length - index}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-900">
                              Quiz Attempt
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(
                              attempt.completedAt || attempt.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Score
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Percentage
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {attempt.percentage}%
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Time
                          </p>

                          <p className="mt-1 text-xl font-bold text-gray-900">
                            {formatTime(attempt.timeUsedSeconds)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                      {attempt.wrongTopics &&
                        attempt.wrongTopics.length > 0 && (
                          <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                            {attempt.wrongTopics.length} topic
                            {attempt.wrongTopics.length !== 1 ? "s" : ""} to
                            review
                          </span>
                        )}

                      {attempt.wrongQuestions &&
                        attempt.wrongQuestions.length > 0 && (
                          <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                            {attempt.wrongQuestions.length} question
                            {attempt.wrongQuestions.length !== 1
                              ? "s"
                              : ""}{" "}
                            missed
                          </span>
                        )}

                      {attempt.timedOut && (
                        <span className="rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                          Time limit reached
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/flashcards/${deckId}/quiz`}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Retake Quiz
                      </Link>

                      {attempt.wrongQuestions &&
                        attempt.wrongQuestions.length > 0 && (
                          <Link
                            href={`/flashcards/${deckId}/quiz`}
                            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            Practice Mistakes
                          </Link>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type QuizQuestion = {
  questionId: string;
  question: string;
  choices: string[];
  topic?: string;
  cardId?: string;
};

type QuizData = {
  quizId: string;
  deckId: string;
  title: string;
  totalQuestions: number;
  startedAt?: string;
  questions: QuizQuestion[];
  timeLimitSeconds?: number;
};

function formatTime(seconds: number) {
  const safeSeconds = Math.max(
    0,
    seconds
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const remaining =
    safeSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remaining).padStart(
    2,
    "0"
  )}`;
}

export default function QuizView() {
  const params = useParams();
  const router = useRouter();

  const deckId =
    String(params.deckId || "");

  const storageKey =
    `studymate_quiz_${deckId}`;

  const [quiz, setQuiz] =
    useState<QuizData | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<string, string>>(
      {}
    );

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [started, setStarted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [timedOut, setTimedOut] =
    useState(false);

  const [startedAt, setStartedAt] =
    useState<number | null>(null);

  /*
   * Load quiz.
   */

  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem(
          storageKey
        );

      if (!saved) {
        router.replace(
          `/flashcards/${deckId}/quiz`
        );
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        !parsed?.quizId ||
        !Array.isArray(
          parsed.questions
        )
      ) {
        router.replace(
          `/flashcards/${deckId}/quiz`
        );
        return;
      }

      setQuiz(parsed);

      const savedAnswers =
        parsed.answers || {};

      setAnswers(
        savedAnswers
      );

      const limit =
        Number(
          parsed.timeLimitSeconds ||
            0
        );

      setRemainingSeconds(
        limit
      );

      if (parsed.startedAt) {
        setStartedAt(
          Number(
            parsed.startedAt
          )
        );
      }
    } catch {
      router.replace(
        `/flashcards/${deckId}/quiz`
      );
    }
  }, [
    deckId,
    router,
    storageKey,
  ]);

  /*
   * Start quiz.
   */

  useEffect(() => {
    if (
      !quiz ||
      started
    ) {
      return;
    }

    const now =
      Date.now();

    setStartedAt(now);
    setStarted(true);

    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ...quiz,
          startedAt: now,
          answers,
        })
      );
    } catch {
      // Ignore storage errors.
    }
  }, [
    quiz,
    started,
    storageKey,
  ]);

  /*
   * Timer.
   */

  useEffect(() => {
    if (
      !quiz ||
      !started ||
      Number(
        quiz.timeLimitSeconds || 0
      ) <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setRemainingSeconds(
          (current) => {
            if (current <= 1) {
              window.clearInterval(
                timer
              );

              setTimedOut(true);

              return 0;
            }

            return current - 1;
          }
        );
      }, 1000);

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    quiz,
    started,
  ]);

  /*
   * Auto-submit when timer ends.
   */

  useEffect(() => {
    if (
      !timedOut ||
      submitting
    ) {
      return;
    }

    handleSubmit(true);
  }, [
    timedOut,
    submitting,
  ]);

  const currentQuestion =
    quiz?.questions?.[
      currentIndex
    ] || null;

  const totalQuestions =
    quiz?.questions?.length || 0;

  const answeredCount =
    Object.keys(
      answers
    ).length;

  const progressText =
    `${currentIndex + 1} of ${totalQuestions}`;

  const isLastQuestion =
    currentIndex ===
    totalQuestions - 1;

  const timerEnabled =
    Number(
      quiz?.timeLimitSeconds || 0
    ) > 0;

  const timerLabel = useMemo(
    () =>
      timerEnabled
        ? formatTime(
            remainingSeconds
          )
        : "No limit",
    [
      timerEnabled,
      remainingSeconds,
    ]
  );

  function chooseAnswer(
    answer: string
  ) {
    if (
      !currentQuestion ||
      submitting
    ) {
      return;
    }

    const nextAnswers = {
      ...answers,

      [currentQuestion.questionId]:
        answer,
    };

    setAnswers(
      nextAnswers
    );

    try {
      const saved =
        sessionStorage.getItem(
          storageKey
        );

      const existing =
        saved
          ? JSON.parse(saved)
          : {};

      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          ...existing,

          answers:
            nextAnswers,
        })
      );
    } catch {
      // Ignore storage errors.
    }
  }

  function goPrevious() {
    if (
      currentIndex <= 0 ||
      submitting
    ) {
      return;
    }

    setCurrentIndex(
      (index) =>
        index - 1
    );
  }

  function goNext() {
    if (
      isLastQuestion ||
      submitting
    ) {
      return;
    }

    setCurrentIndex(
      (index) =>
        index + 1
    );
  }

  async function handleSubmit(
    forceTimedOut = false
  ) {
    if (
      !quiz ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const session =
        await fetchAuthSession();

      const accessToken =
        session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      let actualStartedAt =
        startedAt;

      if (!actualStartedAt) {
        actualStartedAt =
          quiz.startedAt
            ? new Date(
                quiz.startedAt
              ).getTime()
            : Date.now();
      }

      const timeUsedSeconds =
        Math.max(
          0,
          Math.round(
            (Date.now() -
              actualStartedAt) /
              1000
          )
        );

      const response =
        await fetch(
          `${API_BASE}/flashcards/quiz/submit`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              quizId:
                quiz.quizId,

              answers,

              timeLimitSeconds:
                Number(
                  quiz.timeLimitSeconds ||
                    0
                ),

              timeUsedSeconds,

              timedOut:
                forceTimedOut ||
                timedOut,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to submit quiz."
        );
      }

      sessionStorage.setItem(
        `studymate_quiz_result_${deckId}`,
        JSON.stringify(
          data.result
        )
      );

      sessionStorage.removeItem(
        storageKey
      );

      router.push(
        `/flashcards/${deckId}/quiz/result`
      );
    } catch (err) {
      console.error(
        "Quiz submission failed:",
        err
      );

      setSubmitting(false);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quiz."
      );
    }
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-[#f7f5ee] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#66705f]">
              Loading quiz...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-[#f7f5ee] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-[#222820]">
              No quiz questions found.
            </p>

            <Link
              href={`/flashcards/${deckId}/quiz`}
              className="mt-5 inline-flex rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white"
            >
              Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedAnswer =
    answers[
      currentQuestion.questionId
    ];

  return (
    <main className="min-h-screen bg-[#f7f5ee] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href={`/flashcards/${deckId}`}
            className="text-sm font-medium text-[#66705f] transition hover:text-[#222820]"
          >
            ← Exit Quiz
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#41493c] shadow-sm">
              {answeredCount}/
              {totalQuestions}
              {" "}answered
            </span>

            <span className="rounded-full bg-[#eaf7e3] px-4 py-2 text-sm font-bold text-[#2d6a1b]">
              ⏱ {timerLabel}
            </span>
          </div>
        </div>

        {/* Quiz title */}

        <div className="mb-6">
          <p className="text-sm font-semibold text-[#468432]">
            {progressText}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#222820]">
            {quiz.title}
          </h1>
        </div>

        {/* Progress */}

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#e3e0d7]">
          <div
            className="h-full rounded-full bg-[#468432] transition-all duration-300"
            style={{
              width: `${
                ((currentIndex + 1) /
                  totalQuestions) *
                100
              }%`,
            }}
          />
        </div>

        {/* Question */}

        <div className="rounded-3xl bg-white p-7 shadow-sm md:p-9">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b9283]">
              Question {currentIndex + 1}
            </p>

            <h2 className="mt-3 text-xl font-bold leading-relaxed text-[#222820] md:text-2xl">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.choices.map(
              (choice, index) => {
                const letter =
                  String.fromCharCode(
                    65 + index
                  );

                const selected =
                  selectedAnswer ===
                  choice;

                return (
                  <button
                    key={`${currentQuestion.questionId}-${index}`}
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={() =>
                      chooseAnswer(
                        choice
                      )
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#468432] bg-[#edf7e9]"
                        : "border-[#e5e3dc] bg-white hover:border-[#aeb8a4] hover:bg-[#fafaf7]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-[#468432] text-white"
                          : "bg-[#f0efe9] text-[#596151]"
                      }`}
                    >
                      {letter}
                    </span>

                    <span
                      className={`text-sm font-medium leading-relaxed ${
                        selected
                          ? "text-[#2d6a1b]"
                          : "text-[#41493c]"
                      }`}
                    >
                      {choice}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-[#fff0ee] px-4 py-3 text-sm font-medium text-[#b33b2e]">
              {error}
            </div>
          )}

          {/* Navigation */}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#eeece5] pt-6">
            <button
              type="button"
              onClick={
                goPrevious
              }
              disabled={
                currentIndex ===
                  0 ||
                submitting
              }
              className="rounded-xl border border-[#deddd5] bg-white px-5 py-3 text-sm font-semibold text-[#41493c] transition hover:bg-[#f8f7f2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            {!isLastQuestion ? (
              <button
                type="button"
                onClick={
                  goNext
                }
                disabled={
                  submitting
                }
                className="rounded-xl bg-[#468432] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d752c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleSubmit(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="rounded-xl bg-[#468432] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d752c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
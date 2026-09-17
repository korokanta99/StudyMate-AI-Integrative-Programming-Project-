"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type WrongTopic = {
  topic: string;
  count: number;
};

type WrongQuestion = {
  questionId?: string;
  question?: string;
  topic?: string;
  cardId?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
};

type QuizResult = {
  quizId: string;
  deckId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
  timedOut?: boolean;
  wrongTopics?: WrongTopic[];
  wrongQuestions?: WrongQuestion[];
};

export default function QuizResultView() {
  const params = useParams();
  const router = useRouter();

  const deckId = String(params.deckId || "");

  const [result, setResult] =
    useState<QuizResult | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        `studymate_quiz_result_${deckId}`
      );

      if (!saved) {
        router.replace(`/flashcards/${deckId}/quiz`);
        return;
      }

      const parsed = JSON.parse(saved);

      setResult(parsed);
    } catch {
      router.replace(`/flashcards/${deckId}/quiz`);
    }
  }, [deckId, router]);

  if (!result) {
    return (
      <main className="min-h-screen bg-[#f7f5ee] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#66705f]">
              Loading results...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const percentage = Number(result.percentage ?? 0);
  const score = Number(result.score ?? 0);
  const totalQuestions = Number(
    result.totalQuestions ?? 0
  );

  const wrongTopics = result.wrongTopics ?? [];
  const wrongQuestions = result.wrongQuestions ?? [];

  /*
   * A quiz is considered mastered only when
   * every question is answered correctly.
   */
  const isPerfect =
    totalQuestions > 0 &&
    score === totalQuestions &&
    percentage === 100;

  const timeUsed = Number(
    result.timeUsedSeconds ?? 0
  );

  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;

  const timeUsedLabel =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  /*
   * Practice only the questions the user got wrong.
   *
   * The quiz page should read:
   *
   * /quiz?mode=mistakes
   *
   * and request the user's wrong/unmastered
   * questions for this deck.
   */
  const practiceMistakesUrl =
    `/flashcards/${deckId}/quiz?mode=mistakes`;

  const quizHistoryUrl =
    `/flashcards/${deckId}/quiz/history`;

  return (
    <main className="min-h-screen bg-[#f7f5ee] px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-8">
          <Link
            href={`/flashcards/${deckId}`}
            className="text-sm font-medium text-[#66705f] transition hover:text-[#222820]"
          >
            ← Back to Deck
          </Link>

          <p className="mt-7 text-sm font-semibold text-[#468432]">
            Quiz Complete
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#222820]">
            Your Results
          </h1>
        </div>

        {/* Score */}

        <div className="rounded-3xl bg-white p-8 text-center shadow-sm md:p-10">

          <div
            className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full ${
              isPerfect
                ? "bg-[#eaf7e3]"
                : "bg-[#fff4df]"
            }`}
          >
            <div>
              <p
                className={`text-4xl font-bold ${
                  isPerfect
                    ? "text-[#468432]"
                    : "text-[#9a6a16]"
                }`}
              >
                {percentage}%
              </p>

              <p className="mt-1 text-xs font-semibold text-[#66705f]">
                SCORE
              </p>
            </div>
          </div>

          <h2 className="mt-7 text-2xl font-bold text-[#222820]">
            {score} / {totalQuestions}
          </h2>

          {/* Result Message */}

          {isPerfect ? (
            <>
              <p className="mt-2 text-sm text-[#66705f]">
                Excellent work! You answered every
                question correctly.
              </p>

              <p className="mt-3 text-sm font-semibold text-[#468432]">
                🎉 This quiz is mastered!
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-[#66705f]">
                Keep practicing. Study the questions
                you missed and try the mistake quiz
                again.
              </p>

              {wrongQuestions.length > 0 && (
                <p className="mt-3 text-sm font-semibold text-[#9a5b16]">
                  {wrongQuestions.length}{" "}
                  {wrongQuestions.length === 1
                    ? "question needs"
                    : "questions need"}{" "}
                  more practice.
                </p>
              )}
            </>
          )}

          {result.timedOut && (
            <div className="mx-auto mt-5 inline-flex rounded-full bg-[#fff1df] px-4 py-2 text-sm font-semibold text-[#9a5b16]">
              ⏱ Time limit reached
            </div>
          )}

          {/* Stats */}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl bg-[#f7f5ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8b9283]">
                Time Used
              </p>

              <p className="mt-1 text-lg font-bold text-[#222820]">
                {timeUsedLabel}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7f5ee] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8b9283]">
                Questions
              </p>

              <p className="mt-1 text-lg font-bold text-[#222820]">
                {totalQuestions}
              </p>
            </div>

          </div>
        </div>

        {/* Perfect Score */}

        {isPerfect && (
          <div className="mt-6 rounded-3xl bg-[#eaf7e3] p-7 text-center shadow-sm">

            <p className="text-lg font-bold text-[#2d6a1b]">
              🎉 Perfect Score!
            </p>

            <p className="mt-1 text-sm text-[#315525]">
              You answered every question correctly.
              Keep reviewing the deck to maintain
              what you learned.
            </p>

          </div>
        )}

        {/* Topics to Review */}

        {!isPerfect && wrongTopics.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm">

            <h2 className="text-xl font-bold text-[#222820]">
              Topics to Review
            </h2>

            <p className="mt-1 text-sm text-[#66705f]">
              These topics appeared in questions you
              answered incorrectly.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {wrongTopics.map((item, index) => (
                <span
                  key={`${item.topic}-${index}`}
                  className="rounded-full bg-[#eaf7e3] px-4 py-2 text-sm font-semibold text-[#2d6a1b]"
                >
                  {item.topic}

                  {item.count > 1 &&
                    ` (${item.count})`}
                </span>
              ))}
            </div>

          </div>
        )}

        {/* Questions to Review */}

        {!isPerfect && wrongQuestions.length > 0 && (
          <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm">

            <div>
              <h2 className="text-xl font-bold text-[#222820]">
                Questions to Review
              </h2>

              <p className="mt-1 text-sm text-[#66705f]">
                These are the questions you got wrong.
                Practice them again until you master
                them.
              </p>
            </div>

            <div className="mt-5 space-y-4">

              {wrongQuestions.map(
                (item, index) => (
                  <div
                    key={
                      item.questionId ||
                      `${item.cardId || "question"}-${index}`
                    }
                    className="rounded-2xl border border-[#e7e5dd] bg-[#faf9f5] p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <p className="text-sm font-semibold leading-relaxed text-[#222820]">
                        {item.question ||
                          `Question ${
                            index + 1
                          }`}
                      </p>

                      {item.topic && (
                        <span className="shrink-0 rounded-full bg-[#edf7e9] px-3 py-1 text-xs font-semibold text-[#468432]">
                          {item.topic}
                        </span>
                      )}

                    </div>

                    {/* User Answer */}

                    {item.selectedAnswer && (
                      <div className="mt-4 rounded-xl bg-[#fff0ee] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#b33b2e]">
                          Your Answer
                        </p>

                        <p className="mt-1 text-sm text-[#5c302c]">
                          {item.selectedAnswer}
                        </p>
                      </div>
                    )}

                    {/* Correct Answer */}

                    {item.correctAnswer && (
                      <div className="mt-3 rounded-xl bg-[#eaf7e3] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#468432]">
                          Correct Answer
                        </p>

                        <p className="mt-1 text-sm text-[#315525]">
                          {item.correctAnswer}
                        </p>
                      </div>
                    )}

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* Practice Explanation */}

        {!isPerfect && wrongQuestions.length > 0 && (
          <div className="mt-6 rounded-3xl border border-[#dcebd5] bg-[#f0f8eb] p-7">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf7e3] text-lg">
                🌱
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#222820]">
                  Keep practicing
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-[#66705f]">
                  StudyMate will use your missed
                  questions to create a focused practice
                  quiz. Questions you continue to answer
                  incorrectly will stay in your practice
                  set until you master them.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Actions */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <Link
            href={`/flashcards/${deckId}/review`}
            className="flex-1 rounded-xl border border-[#d8d6ce] bg-white px-6 py-3 text-center text-sm font-semibold text-[#41493c] transition hover:bg-[#f8f7f2]"
          >
            Review Flashcards
          </Link>

          {!isPerfect && wrongQuestions.length > 0 && (
            <Link
              href={practiceMistakesUrl}
              className="flex-1 rounded-xl bg-[#468432] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3d752c]"
            >
              Practice Mistakes →
            </Link>
          )}

          <Link
            href={`/flashcards/${deckId}/quiz`}
            className="flex-1 rounded-xl border border-[#468432] bg-white px-6 py-3 text-center text-sm font-semibold text-[#468432] transition hover:bg-[#f3f8ef]"
          >
            Retake Full Quiz
          </Link>

        </div>

        {/* Quiz History */}

        <div className="mt-4">

          <Link
            href={quizHistoryUrl}
            className="block rounded-xl border border-[#d8d6ce] bg-white px-6 py-3 text-center text-sm font-semibold text-[#41493c] transition hover:bg-[#f8f7f2]"
          >
            View Quiz History
          </Link>

        </div>

        

      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

import Icon from "@/components/ui/Icon";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type Flashcard = {
  cardId?: string;
  question: string;
  answer: string;
  explanation?: string;
  source?: string;
  order?: number;
};

type Deck = {
  deckId: string;
  title: string;
  materialName: string;
  cardCount: number;
  cards: Flashcard[];
  progress?: number;
  reviewedCount?: number;
  totalCards?: number;
  completed?: boolean;
  reviewedCardIds?: string[];
};

export default function ReviewView() {
  const params = useParams();

  const deckId = Array.isArray(params.deckId)
    ? params.deckId[0]
    : params.deckId;

  const [deck, setDeck] =
    useState<Deck | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [savingProgress, setSavingProgress] =
    useState(false);

  const [reviewedCardIds, setReviewedCardIds] =
    useState<string[]>([]);

  /* Token */
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

  /* Study activity */
  async function recordStudyActivity(
    token: string
  ) {
    try {
      await fetch(
        `${API_BASE}/activity`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Failed to record study activity:",
        error
      );
    }
  }

  /* Load deck */
  async function loadDeck() {
    try {
      setLoading(true);
      setError("");

      const token =
        await getToken();

      const response =
        await fetch(
          `${API_BASE}/flashcards/${deckId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load this flashcard deck."
        );
      }

      const apiDeck =
        data.deck || {};

      const apiCards =
        Array.isArray(
          apiDeck.cards
        )
          ? apiDeck.cards
          : Array.isArray(
                data.cards
              )
            ? data.cards
            : [];

      const existingReviewedIds =
        Array.isArray(
          apiDeck.reviewedCardIds
        )
          ? apiDeck.reviewedCardIds
          : Array.isArray(
                data.reviewedCardIds
              )
            ? data.reviewedCardIds
            : [];

      const normalizedDeck: Deck = {
        deckId:
          apiDeck.deckId ||
          deckId ||
          "",
        title:
          apiDeck.title ||
          "Flashcard Deck",
        materialName:
          apiDeck.materialName ||
          "Uploaded material",
        cardCount:
          apiDeck.cardCount ||
          apiCards.length,
        cards: apiCards,
        progress: Number(
          apiDeck.progress ??
            data.progress ??
            0
        ),
        reviewedCount: Number(
          apiDeck.reviewedCount ??
            data.reviewedCount ??
            existingReviewedIds.length
        ),
        totalCards: Number(
          apiDeck.totalCards ??
            data.totalCards ??
            apiCards.length
        ),
        completed: Boolean(
          apiDeck.completed ??
            data.completed ??
            false
        ),
        reviewedCardIds:
          existingReviewedIds,
      };

      setDeck(normalizedDeck);

      setReviewedCardIds(
        existingReviewedIds
      );

      if (apiCards.length > 0) {
        await recordStudyActivity(
          token
        );
      }
    } catch (err) {
      console.error(
        "Failed to load flashcard deck:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this flashcard deck."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (deckId) {
      loadDeck();
    }
  }, [deckId]);

  /* Save progress */
  async function markCardReviewed(
    card: Flashcard
  ) {
    if (
      !deck ||
      !card.cardId ||
      savingProgress
    ) {
      return;
    }

    const cardId =
      card.cardId;

    if (
      reviewedCardIds.includes(
        cardId
      )
    ) {
      return;
    }

    try {
      setSavingProgress(true);
      setError("");

      const token =
        await getToken();

      const response =
        await fetch(
          `${API_BASE}/flashcards/progress`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              deckId:
                deck.deckId,
              cardId,
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
            "Unable to save flashcard progress."
        );
      }

      const newReviewedIds =
        Array.from(
          new Set([
            ...reviewedCardIds,
            cardId,
          ])
        );

      const total =
        deck.cards.length;

      const reviewed =
        Number(
          data.reviewedCount ??
            newReviewedIds.length
        );

      const newProgress =
        Number(
          data.progress ??
            (total > 0
              ? Math.round(
                  (reviewed / total) *
                    100
                )
              : 0)
        );

      const completed =
        Boolean(
          data.completed ??
            newProgress >= 100
        );

      setReviewedCardIds(
        newReviewedIds
      );

      setDeck((current) =>
        current
          ? {
              ...current,
              reviewedCardIds:
                newReviewedIds,
              reviewedCount:
                reviewed,
              totalCards:
                total,
              progress:
                newProgress,
              completed,
            }
          : current
      );
    } catch (err) {
      console.error(
        "Failed to save flashcard progress:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save flashcard progress."
      );
    } finally {
      setSavingProgress(false);
    }
  }

  /* Reveal answer */
  async function revealAnswer() {
    if (!deck) {
      return;
    }

    setShowAnswer(true);

    await markCardReviewed(
      deck.cards[currentIndex]
    );
  }

  /* Flip */
  function handleCardClick() {
    if (showAnswer) {
      setShowAnswer(false);
    } else {
      revealAnswer();
    }
  }

  /* Next */
  function handleNext() {
    if (!deck) {
      return;
    }

    if (
      currentIndex <
      deck.cards.length - 1
    ) {
      setCurrentIndex(
        (index) => index + 1
      );

      setShowAnswer(false);
    }
  }

  /* Previous */
  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(
        (index) => index - 1
      );

      setShowAnswer(false);
    }
  }

  /* Loading */
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">
        <div className="flex w-full">
          <Link
            href="/flashcards"
            className="text-sm font-semibold text-[#41493c]"
          >
            ← Back to Flashcards
          </Link>
        </div>

        <div className="mt-16 w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-[0_12px_40px_rgba(70,132,50,.12)]">
          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Loading flashcards...
          </h1>

          <p className="mt-2 text-sm text-[#41493c]">
            Loading your generated cards.
          </p>
        </div>
      </div>
    );
  }

  /* Error */
  if (
    error &&
    !deck
  ) {
    return (
      <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">
        <div className="flex w-full">
          <Link
            href="/flashcards"
            className="text-sm font-semibold text-[#41493c]"
          >
            ← Back to Flashcards
          </Link>
        </div>

        <div className="mt-16 w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-[0_12px_40px_rgba(70,132,50,.12)]">
          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Unable to load flashcards
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#41493c]">
            {error}
          </p>

          <Link
            href="/flashcards"
            className="mt-6 inline-flex rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Flashcards
          </Link>
        </div>
      </div>
    );
  }

  /* Empty */
  if (
    !deck ||
    deck.cards.length === 0
  ) {
    return (
      <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">
        <div className="flex w-full">
          <Link
            href="/flashcards"
            className="text-sm font-semibold text-[#41493c]"
          >
            ← Back to Flashcards
          </Link>
        </div>

        <div className="mt-16 w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-[0_12px_40px_rgba(70,132,50,.12)]">
          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            No flashcards to review
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#41493c]">
            This deck does not contain any generated flashcards yet.
          </p>

          <Link
            href="/flashcards"
            className="mt-6 inline-flex rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Flashcards
          </Link>
        </div>
      </div>
    );
  }

  const currentCard =
    deck.cards[currentIndex];

  const totalCards =
    deck.cards.length;

  const reviewedCount =
    reviewedCardIds.length;

  const progress =
    totalCards > 0
      ? Math.round(
          (reviewedCount /
            totalCards) *
            100
        )
      : 0;

  const completed =
    progress >= 100;

  const currentCardReviewed =
    currentCard.cardId
      ? reviewedCardIds.includes(
          currentCard.cardId
        )
      : false;

  return (
    <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">

      {/* Header */}
      <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">

        <Link
          href="/flashcards"
          className="text-sm font-semibold text-[#41493c]"
        >
          ← Back to Flashcards
        </Link>

        <div className="text-right">
          <p className="text-sm font-semibold">
            {deck.title}
          </p>

          <p className="text-xs text-[#717a6b]">
            {deck.materialName}
          </p>
        </div>

      </div>

      {/* Study Progress */}
      <div className="mt-8 w-full max-w-3xl">

        <div className="flex items-center justify-between text-xs font-semibold text-[#41493c]">
          <span>
            {reviewedCount} of{" "}
            {totalCards} cards reviewed
          </span>

          <span className="text-[#2d6a1b]">
            {progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2dd]">
          <div
            className="h-full rounded-full bg-[#468432] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[10px] text-[#717a6b]">
          <span>
            Card {currentIndex + 1} of{" "}
            {totalCards}
          </span>

          <span>
            {completed
              ? "All cards reviewed"
              : "Keep going"}
          </span>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 w-full max-w-3xl rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a52a1f]">
          {error}
        </div>
      )}

      {/* Flashcard */}
      <div className="mt-8 w-full max-w-3xl [perspective:1400px]">

        <button
          type="button"
          onClick={handleCardClick}
          disabled={savingProgress}
          className="w-full text-left disabled:cursor-wait"
          aria-label={
            showAnswer
              ? "Show question"
              : "Show answer"
          }
        >

          <div
            className={`relative h-[390px] w-full transition-transform duration-500 ease-[cubic-bezier(.4,.2,.2,1)] [transform-style:preserve-3d] ${
              showAnswer
                ? "[transform:rotateY(180deg)]"
                : ""
            }`}
          >

            {/* Question */}
            <article className="absolute inset-0 flex h-full flex-col overflow-hidden rounded-3xl bg-white p-8 shadow-[0_12px_40px_rgba(70,132,50,.10)] [backface-visibility:hidden] sm:p-10">

              <div className="flex shrink-0 items-center justify-between">

                <span className="rounded-full bg-[#f0eee8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2d6a1b]">
                  Question
                </span>

                <Icon
                  name="card"
                  className="size-6 text-[#2d6a1b]"
                />

              </div>

              <div className="flex flex-1 flex-col justify-center overflow-y-auto py-6">

                <p className="text-xs font-bold uppercase tracking-wider text-[#717a6b]">
                  Question
                </p>

                <h1 className="mt-4 text-2xl font-bold leading-relaxed sm:text-3xl">
                  {currentCard.question}
                </h1>

              </div>

              <div className="shrink-0 border-t border-[#f0eee8] pt-5 text-center">

                <p className="text-xs font-semibold text-[#717a6b]">
                  Click the card to reveal the answer
                </p>

              </div>

            </article>

            {/* Answer */}
            <article className="absolute inset-0 flex h-full flex-col overflow-hidden rounded-3xl bg-white p-8 shadow-[0_12px_40px_rgba(70,132,50,.10)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-10">

              <div className="flex shrink-0 items-center justify-between">

                <span className="rounded-full bg-[#eaf7e3] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2d6a1b]">
                  Answer
                </span>

                <Icon
                  name="card"
                  className="size-6 text-[#2d6a1b]"
                />

              </div>

              <div className="flex-1 overflow-y-auto py-6">

                <p className="text-xs font-bold uppercase tracking-wider text-[#717a6b]">
                  Answer
                </p>

                <h1 className="mt-4 text-2xl font-bold leading-relaxed sm:text-3xl">
                  {currentCard.answer}
                </h1>

                {currentCard.explanation && (
                  <div className="mt-8 rounded-xl bg-[#f5f3ee] p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-[#717a6b]">
                      Explanation
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#41493c]">
                      {
                        currentCard.explanation
                      }
                    </p>

                  </div>
                )}

              </div>

              <div className="shrink-0 border-t border-[#f0eee8] pt-5 text-center">

                {currentCardReviewed ? (
                  <p className="text-xs font-semibold text-[#468432]">
                    ✓ Card reviewed
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-[#717a6b]">
                    Click the card to show the question
                  </p>
                )}

              </div>

            </article>

          </div>

        </button>

      </div>

      {/* Controls */}
      <div className="mt-6 flex w-full max-w-3xl items-center justify-between gap-3">

        <button
          type="button"
          disabled={
            currentIndex === 0
          }
          onClick={handlePrevious}
          className="rounded-xl bg-[#f0eee8] px-5 py-3 text-sm font-semibold text-[#41493c] transition hover:bg-[#e7e5df] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          disabled={savingProgress}
          onClick={() => {
            if (showAnswer) {
              setShowAnswer(false);
            } else {
              revealAnswer();
            }
          }}
          className="rounded-xl bg-[#ffdcbe] px-5 py-3 text-sm font-semibold text-[#2c1600] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProgress
            ? "Saving..."
            : showAnswer
              ? "Show Question"
              : "Show Answer"}
        </button>

        <button
          type="button"
          disabled={
            currentIndex ===
            totalCards - 1
          }
          onClick={handleNext}
          className="rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d752c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>

      </div>

      {/* Completion */}
      {completed && (
        <div className="mt-8 w-full max-w-3xl rounded-2xl bg-[#eaf7e3] p-5">

          <p className="text-sm font-bold text-[#2d6a1b]">
            ✓ Deck completed
          </p>

          <h2 className="mt-1 text-lg font-bold">
            You reviewed all{" "}
            {totalCards} cards!
          </h2>

          <p className="mt-1 text-sm text-[#41493c]">
            Your quiz is now unlocked.
          </p>

        </div>
      )}

      {/* Information */}
      <div className="mt-8 flex w-full flex-col justify-between gap-2 rounded-xl bg-[#f0eee8] p-4 text-sm sm:flex-row">

        <span>
          ✦ Generated from{" "}
          {deck.materialName}
        </span>

        <span>
          Source-grounded review
        </span>

      </div>

    </div>
  );
}
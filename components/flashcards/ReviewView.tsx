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

  async function getToken() {
    const session =
      await fetchAuthSession();

    const token =
      session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    return token;
  }

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

      /*
       * API may return cards either inside
       * deck.cards or as data.cards.
       */
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
      };

      setDeck(normalizedDeck);
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

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(
        (index) => index - 1
      );

      setShowAnswer(false);
    }
  }

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

  /*
   * Safe empty state.
   * deck.cards is always an array after normalization.
   */
  if (
    error ||
    !deck ||
    deck.cards.length === 0
  ) {
    return (
      <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col items-center">

        {/* Header */}
        <div className="flex w-full">
          <Link
            href="/flashcards"
            className="text-sm font-semibold text-[#41493c]"
          >
            ← Back to Flashcards
          </Link>
        </div>

        {/* Empty State */}
        <div className="mt-16 w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-[0_12px_40px_rgba(70,132,50,.12)]">

          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-7"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {error
              ? "Unable to load flashcards"
              : "No flashcards to review"}
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#41493c]">
            {error ||
              "This deck does not contain any generated flashcards yet."}
          </p>

          <Link
            href="/flashcards"
            className="mt-6 inline-flex rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Flashcards
          </Link>
        </div>

        {/* Information */}
        <div className="mt-8 flex w-full flex-col justify-between gap-2 rounded-xl bg-[#f0eee8] p-4 text-sm sm:flex-row">
          <span>
            ✦ Flashcards are generated from your
            uploaded materials.
          </span>

          <span>
            Source-grounded review
          </span>
        </div>

      </div>
    );
  }

  const currentCard =
    deck.cards[currentIndex];

  const totalCards =
    deck.cards.length;

  const progress =
    ((currentIndex + 1) /
      totalCards) *
    100;

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

      {/* Progress */}
      <div className="mt-8 w-full max-w-3xl">

        <div className="flex items-center justify-between text-xs font-semibold text-[#41493c]">
          <span>
            Card {currentIndex + 1} of{" "}
            {totalCards}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2dd]">
          <div
            className="h-full rounded-full bg-[#468432] transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>

      {/* Flashcard */}
      <div className="mt-8 w-full max-w-3xl">

        <button
          type="button"
          onClick={() =>
            setShowAnswer(
              (visible) => !visible
            )
          }
          className="w-full text-left"
        >
          <article className="min-h-[390px] rounded-3xl bg-white p-8 shadow-[0_12px_40px_rgba(70,132,50,.12)] transition hover:shadow-[0_16px_45px_rgba(70,132,50,.16)] sm:p-10">

            {/* Card Header */}
            <div className="flex items-center justify-between">

              <span className="rounded-full bg-[#f0eee8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2d6a1b]">
                {showAnswer
                  ? "Answer"
                  : "Question"}
              </span>

              <Icon
                name="card"
                className="size-6 text-[#2d6a1b]"
              />

            </div>

            {/* Card Content */}
            <div className="mt-12">

              <p className="text-xs font-bold uppercase tracking-wider text-[#717a6b]">
                {showAnswer
                  ? "Answer"
                  : "Question"}
              </p>

              <h1 className="mt-4 text-2xl font-bold leading-relaxed sm:text-3xl">
                {showAnswer
                  ? currentCard.answer
                  : currentCard.question}
              </h1>

            </div>

            {/* Explanation */}
            {showAnswer &&
              currentCard.explanation && (
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

            {!showAnswer && (
              <p className="mt-12 text-center text-xs font-semibold text-[#717a6b]">
                Click the card to reveal the answer
              </p>
            )}

          </article>
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
          className="rounded-xl bg-[#f0eee8] px-5 py-3 text-sm font-semibold text-[#41493c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={() =>
            setShowAnswer(
              (visible) => !visible
            )
          }
          className="rounded-xl bg-[#ffdcbe] px-5 py-3 text-sm font-semibold text-[#2c1600]"
        >
          {showAnswer
            ? "Hide Answer"
            : "Show Answer"}
        </button>

        <button
          type="button"
          disabled={
            currentIndex ===
            totalCards - 1
          }
          onClick={handleNext}
          className="rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>

      </div>

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
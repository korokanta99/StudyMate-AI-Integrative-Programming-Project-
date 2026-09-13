"use client";

import Link from "next/link";
import { useState } from "react";

import Icon from "@/components/ui/Icon";

const TOTAL_CARDS = 12;

export default function ReviewView() {
  const [flipped, setFlipped] = useState(false);
  const [card, setCard] = useState(4);
  const [toast, setToast] = useState("");

  // Rate the current card
  function rate(message: string) {
    setToast(message);
    setCard((currentCard) =>
      Math.min(TOTAL_CARDS, currentCard + 1)
    );
    setFlipped(false);
  }

  // Go to the previous card
  function previousCard() {
    setCard((currentCard) =>
      Math.max(1, currentCard - 1)
    );
    setFlipped(false);
    setToast("");
  }

  // Go to the next card
  function nextCard() {
    setCard((currentCard) =>
      Math.min(TOTAL_CARDS, currentCard + 1)
    );
    setFlipped(false);
    setToast("");
  }

  const progress = (card / TOTAL_CARDS) * 100;

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

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-[#e4e2dd] px-3 py-2">
            Quiz Mode: 00:45
          </span>

          <span className="rounded-full bg-white px-3 py-2 shadow-sm">
            Cell Biology — Ch. 3 ·{" "}
            <b className="text-[#2d6a1b]">
              Card {card} of {TOTAL_CARDS}
            </b>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-[#e4e2dd]">
        <i
          className="block h-full bg-[#2d6a1b]"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Flashcard */}
      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className="mt-12 flex min-h-80 w-full max-w-3xl flex-col justify-between rounded-2xl bg-white p-8 text-left shadow-[0_12px_40px_rgba(70,132,50,.12)] transition hover:shadow-[0_16px_45px_rgba(70,132,50,.16)]"
      >
        {/* Card label */}
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[#717a6b]">
          <span>
            {flipped ? "Answer" : "Question"} · Cell Biology
          </span>

          <Icon
            name="spark"
            className="size-5 text-[#2d6a1b]"
          />
        </div>

        {/* Card content */}
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-relaxed">
            {flipped
              ? "During anaphase, sister chromatids separate and are pulled to opposite spindle poles."
              : "What is the primary role of the spindle fibers during mitosis?"}
          </h1>

          {flipped && (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#41493c]">
              They attach to chromosomes at the centromere
              and coordinate equal genetic distribution into
              daughter cells.
            </p>
          )}
        </div>

        {/* Flip instruction */}
        <span className="mx-auto text-sm text-[#717a6b]">
          {flipped
            ? "Tap to see question"
            : "Tap card to reveal answer"}
        </span>
      </button>

      {/* Card controls */}
      <div className="mt-8 flex items-center gap-5">
        <button
          type="button"
          onClick={previousCard}
          disabled={card === 1}
          className="rounded-full bg-[#eae8e2] p-3 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous card"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() =>
            rate(
              "Still learning — we’ll bring this back soon"
            )
          }
          className="rounded-xl bg-[#ffdcbe] px-6 py-3 text-sm font-semibold text-[#2c1600]"
        >
          ↻ Still Learning
        </button>

        <button
          type="button"
          onClick={() => rate("Known — great work!")}
          className="rounded-xl bg-[#b4f48a] px-6 py-3 text-sm font-semibold text-[#215100]"
        >
          ✓ Know It
        </button>

        <button
          type="button"
          onClick={nextCard}
          disabled={card === TOTAL_CARDS}
          className="rounded-full bg-[#eae8e2] p-3 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next card"
        >
          ›
        </button>
      </div>

      {/* Rating notification */}
      {toast && (
        <div className="mt-6 rounded-full bg-[#30312d] px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}

      {/* Spaced repetition information */}
      <div className="mt-8 flex w-full flex-col justify-between gap-2 rounded-xl bg-[#f0eee8] p-4 text-sm sm:flex-row">
        <span>
          ✦ Spaced repetition adjusts your next review.
        </span>

        <span>
          Source note · Lecture 03 p.14
        </span>
      </div>
    </div>
  );
}
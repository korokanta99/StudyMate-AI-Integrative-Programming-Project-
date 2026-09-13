"use client";

import { useState } from "react";

import Icon from "@/components/ui/Icon";

type FlashcardDeck = {
  title: string;
  description: string;
  mastery: number;
  tag: string;
  status?: "new" | "strong" | "normal";
};

// Real flashcard decks will be loaded from the backend.
// No demo/fake decks.
const decks: FlashcardDeck[] = [];

function getTopBarClass(deck: FlashcardDeck) {
  if (deck.status === "new") {
    return "bg-[#ffa02e]";
  }

  if (deck.status === "strong") {
    return "bg-[#356b10]";
  }

  return "bg-[#468432]";
}

function getButtonClass(deck: FlashcardDeck) {
  if (deck.status === "new") {
    return "bg-[#ffa02e] text-white";
  }

  return "bg-[#468432] text-white";
}

function getMasteryLabel(deck: FlashcardDeck) {
  if (deck.status === "new") {
    return "Fresh deck generated";
  }

  return `${deck.mastery}% Mastery`;
}

function getCardCount(deck: FlashcardDeck) {
  const match = deck.description.match(
    /(\d+)\s+cards/
  );

  return match ? Number(match[1]) : 0;
}

function getMasteryCount(deck: FlashcardDeck) {
  const cardCount = getCardCount(deck);

  if (deck.status === "new") {
    return `0/${cardCount} known`;
  }

  const mastered = Math.round(
    (deck.mastery / 100) * cardCount
  );

  return `${mastered}/${cardCount} mastered`;
}

function getBottomLabel(deck: FlashcardDeck) {
  if (deck.status === "new") {
    return "Ready to start";
  }

  if (deck.status === "strong") {
    return "Ready for exam";
  }

  return getMasteryCount(deck);
}

type FlashcardCardProps = {
  deck: FlashcardDeck;
};

function FlashcardCard({
  deck,
}: FlashcardCardProps) {
  return (
    <article className="relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
      {/* Top accent */}
      <i
        className={`absolute inset-x-0 top-0 h-1 ${getTopBarClass(
          deck
        )}`}
      />

      <div>
        {/* Card header */}
        <div className="flex justify-between">
          <span className="grid size-8 place-items-center rounded-lg bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-5"
            />
          </span>

          <span className="rounded-full bg-[#eae8e2] px-2 py-1 text-[11px] font-bold text-[#41493c]">
            {deck.tag}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-5 text-lg font-semibold">
          {deck.title}
        </h2>

        <p className="mt-1 text-sm text-[#41493c]">
          {deck.description}
        </p>

        {/* Mastery */}
        <div className="mt-5 rounded-xl bg-[#f5f3ee] p-3">
          <div className="flex justify-between text-[11px] font-bold">
            <span>
              {getMasteryLabel(deck)}
            </span>

            <span className="text-[#2d6a1b]">
              {getMasteryCount(deck)}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2dd]">
            <i
              className="block h-full rounded-full bg-[#99d771]"
              style={{
                width: `${deck.mastery}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#41493c]">
          {getBottomLabel(deck)}
        </span>

        <button
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${getButtonClass(
            deck
          )}`}
        >
          ▶{" "}
          {deck.status === "new"
            ? "Start First Session"
            : "Review"}
        </button>
      </div>
    </article>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <Icon
        name="search"
        className="absolute left-3 top-3 size-4 text-[#717a6b]"
      />

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search flashcard decks..."
        className="w-full rounded-xl bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
      />
    </div>
  );
}

export default function FlashcardsView() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredDecks = decks.filter(
    (deck) =>
      deck.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const totalCards = decks.reduce(
    (total, deck) =>
      total + getCardCount(deck),
    0
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#2d6a1b]">
            Active recall library
          </div>

          <h1 className="text-[32px] font-bold tracking-tight">
            My Flashcards
          </h1>

          <p className="text-sm text-[#41493c]">
            Generated from your uploaded course
            materials
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-[#ffdcbe] px-5 py-3 text-sm font-semibold text-[#2c1600]"
        >
          ✦ Generate from Material
        </button>
      </div>

      {/* Search / Filter Bar */}
      <div className="mt-7 flex flex-col gap-3 rounded-xl bg-[#f0eee8] p-4 sm:flex-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <select className="rounded-xl bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]">
          <option>All materials</option>
        </select>

        <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#2d6a1b]">
          {totalCards} cards
        </span>
      </div>

      {/* Flashcard Decks */}
      {filteredDecks.length > 0 && (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDecks.map((deck) => (
            <FlashcardCard
              key={deck.title}
              deck={deck}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredDecks.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon
              name="card"
              className="size-6"
            />
          </div>

          <h2 className="mt-4 font-semibold">
            No flashcard decks yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-[#41493c]">
            Upload course material first. StudyMate
            AI will generate flashcards from your
            uploaded materials.
          </p>
        </div>
      )}

      {/* Bottom Information */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Sync Information */}
        <div className="rounded-2xl bg-[#f0eee8] p-5 lg:col-span-2">
          <b className="text-[#356b10]">
            ⌁ Sync Active
          </b>

          <h2 className="mt-2 text-lg font-semibold">
            Generated from your uploaded course
            notes
          </h2>

          <p className="mt-1 text-sm text-[#41493c]">
            StudyMate AI continuously aligns
            questions with your uploaded study
            materials.
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="grid size-16 place-items-center rounded-full border-4 border-[#2d6a1b] font-bold text-[#2d6a1b]">
            82%
          </span>

          <div>
            <b>Weekly Goal Progress</b>

            <p className="text-sm text-[#41493c]">
              No cards retained yet
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
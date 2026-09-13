"use client";

import Link from "next/link";
import { useState } from "react";

import Icon from "@/components/ui/Icon";

type FlashcardDeck = {
  title: string;
  description: string;
  mastery: number;
  tag: string;
  status?: "new" | "strong" | "normal";
};

const decks: FlashcardDeck[] = [
  {
    title: "Cell Biology — Ch. 3",
    description: "12 cards • reviewed today",
    mastery: 78,
    tag: "BIO 101",
    status: "normal",
  },
  {
    title: "CS101 Syllabus Terms",
    description: "8 cards • reviewed 5d ago",
    mastery: 62,
    tag: "Due today",
    status: "normal",
  },
  {
    title: "Midterm Reviewer",
    description: "15 cards • never reviewed",
    mastery: 0,
    tag: "NEW",
    status: "new",
  },
  {
    title: "Chapter 5 Notes",
    description: "9 cards • reviewed 1w ago",
    mastery: 60,
    tag: "CHEM 102",
    status: "normal",
  },
  {
    title: "Mitosis Deep Dive",
    description: "6 cards • reviewed yesterday",
    mastery: 92,
    tag: "Strong Recall",
    status: "strong",
  },
  {
    title: "Data Structures Basics",
    description: "4 cards • reviewed 3d ago",
    mastery: 75,
    tag: "CS 201",
    status: "normal",
  },
];

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

function getMasteryCount(deck: FlashcardDeck) {
  if (deck.status === "new") {
    return "0/15 known";
  }

  const cardCount = Number(deck.description.split(" ")[0]);

  const mastered = Math.round(
    (deck.mastery / 100) * cardCount
  );

  return `${mastered}/${cardCount} mastered`;
}

function getBottomLabel(
  deck: FlashcardDeck
) {
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
              {deck.status === "new"
                ? "0/15 known"
                : `${deck.mastery}%`}
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

        <Link
          href="/flashcards/cell-biology"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${getButtonClass(
            deck
          )}`}
        >
          ▶{" "}
          {deck.status === "new"
            ? "Start First Session"
            : "Review"}
        </Link>
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

  return (
    <>
      {/* =========================================
          PAGE HEADER
      ========================================== */}
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

      {/* =========================================
          SEARCH / FILTER BAR
      ========================================== */}
      <div className="mt-7 flex flex-col gap-3 rounded-xl bg-[#f0eee8] p-4 sm:flex-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <select className="rounded-xl bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]">
          <option>All materials</option>
        </select>

        <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#2d6a1b]">
          44 cards due this week
        </span>
      </div>

      {/* =========================================
          FLASHCARD DECKS
      ========================================== */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDecks.map((deck) => (
          <FlashcardCard
            key={deck.title}
            deck={deck}
          />
        ))}
      </div>

      {/* Empty search state */}
      {filteredDecks.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="font-semibold">
            No flashcard decks found
          </h2>

          <p className="mt-1 text-sm text-[#41493c]">
            Try a different search term.
          </p>
        </div>
      )}

      {/* =========================================
          BOTTOM INFORMATION
      ========================================== */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Sync information */}
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
            questions with syllabus updates and
            lecture recording transcripts.
          </p>
        </div>

        {/* Weekly goal */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="grid size-16 place-items-center rounded-full border-4 border-[#2d6a1b] font-bold text-[#2d6a1b]">
            82%
          </span>

          <div>
            <b>Weekly Goal Progress</b>

            <p className="text-sm text-[#41493c]">
              44 / 54 cards retained
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
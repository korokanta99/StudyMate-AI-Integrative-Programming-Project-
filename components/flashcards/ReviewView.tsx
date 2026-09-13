"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function ReviewView() {
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
          No flashcards to review
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#41493c]">
          Flashcards will appear here after StudyMate
          AI generates them from your uploaded course
          materials.
        </p>

        <Link
          href="/materials"
          className="mt-6 inline-flex rounded-xl bg-[#468432] px-5 py-3 text-sm font-semibold text-white"
        >
          Go to Materials
        </Link>
      </div>

      {/* Information */}
      <div className="mt-8 flex w-full flex-col justify-between gap-2 rounded-xl bg-[#f0eee8] p-4 text-sm sm:flex-row">
        <span>
          ✦ Flashcards are generated from your uploaded
          materials.
        </span>

        <span>
          Source-grounded review
        </span>
      </div>
    </div>
  );
}
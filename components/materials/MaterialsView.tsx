"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

type DocumentItem = {
  name: string;
  uploaded: string;
  insight: string;
  category: "Biology" | "CS101" | "Notes" | "Midterms";
  sizeMb: number;
  readiness: number;
};

const initialDocs: DocumentItem[] = [
  {
    name: "Lecture_03_Cell_Biology.pdf",
    uploaded: "Uploaded Aug 28 • 2.4 MB",
    insight: "32 key flashcards & 1 summary ready • 100% indexed",
    category: "Biology",
    sizeMb: 2.4,
    readiness: 100,
  },
  {
    name: "Syllabus_CS101.docx",
    uploaded: "Uploaded Aug 24 • 450 KB",
    insight: "14 scheduled deadlines identified • 100% indexed",
    category: "CS101",
    sizeMb: 0.45,
    readiness: 100,
  },
  {
    name: "Midterm_Reviewer.pdf",
    uploaded: "Uploaded Aug 20 • 1.1 MB",
    insight: "50 practice quiz questions ready • 100% indexed",
    category: "Midterms",
    sizeMb: 1.1,
    readiness: 100,
  },
  {
    name: "Chapter5_Notes.pdf",
    uploaded: "Uploaded Aug 18 • 920 KB",
    insight: "12 concepts linked to flashcard decks",
    category: "Notes",
    sizeMb: 0.92,
    readiness: 100,
  },
];

const categories = [
  "All (4)",
  "Biology",
  "CS101",
  "Notes",
  "Midterms",
];

export default function MaterialsView({
  dashboard = false,
}: {
  dashboard?: boolean;
}) {
  const [docs, setDocs] = useState(initialDocs);
  const [q, setQ] = useState("");
  const [pill, setPill] = useState("All (4)");
  const [sort, setSort] = useState("Last uploaded");

  const list = useMemo(() => {
    let filtered = docs.filter((doc) => {
      const search = q.toLowerCase();

      const matchesSearch =
        doc.name.toLowerCase().includes(search) ||
        doc.insight.toLowerCase().includes(search) ||
        doc.category.toLowerCase().includes(search);

      const matchesCategory =
        pill === "All (4)" || doc.category === pill;

      return matchesSearch && matchesCategory;
    });

    if (sort === "Quiz readiness") {
      filtered = [...filtered].sort(
        (a, b) => b.readiness - a.readiness
      );
    }

    return filtered;
  }, [docs, q, pill, sort]);

  const totalStorage = docs.reduce(
    (total, doc) => total + doc.sizeMb,
    0
  );

  const deleteDocument = (name: string) => {
    setDocs((current) =>
      current.filter((doc) => doc.name !== name)
    );

    if (pill === "All (4)") {
      setPill("All (4)");
    }
  };

  return (
    <>
      {/* Header / Vault Summary */}
      <section className="mb-8 flex flex-col justify-between gap-6 rounded-xl bg-white p-6 shadow-md lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="rounded-full bg-[#b4f48a] px-2 py-1 text-[#3a7117]">
              Workspace Vault
            </span>

            <span className="self-center text-[#2d6a1b]">
              ● AI Sync Active
            </span>
          </div>

          <h1 className="text-[32px] font-bold tracking-tight">
            {dashboard
              ? "Your Study Dashboard"
              : "My Study Materials"}
          </h1>

          <p className="mt-1 text-sm text-[#41493c]">
            {docs.length} documents uploaded{" "}
            <b className="mx-1 text-[#2d6a1b]">
              • 85% ready for quiz
            </b>{" "}
            • Storage:{" "}
            <strong>
              {totalStorage.toFixed(2)} MB
            </strong>{" "}
            / 50 MB
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Vault Cap */}
          <div className="hidden w-36 rounded-lg bg-[#f5f3ee] p-2 text-[11px] xl:block">
            <div className="flex justify-between">
              <span>Vault Cap</span>
              <b className="text-[#2d6a1b]">
                {Math.round((totalStorage / 50) * 100)}%
              </b>
            </div>

            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e4e2dd]">
              <i
                className="block h-full bg-[#2d6a1b]"
                style={{
                  width: `${Math.min(
                    (totalStorage / 50) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Upload */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#ffdcbe] px-5 py-3 text-sm font-semibold text-[#2c1600] shadow-sm hover:bg-[#ac6500] hover:text-white"
          >
            <Icon name="upload" className="size-5" />
            + Upload Material (PDF / DOCX)
          </button>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-4 top-3.5 size-5 text-[#717a6b]"
            />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search uploaded documents, summaries, topics..."
              className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none focus:bg-[#f5f3ee]"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"
          >
            <option>Last uploaded</option>
            <option>Quiz readiness</option>
          </select>
        </div>

        <div className="mt-4 flex gap-2 overflow-auto">
          {categories.map((category) => (
            <button
              type="button"
              onClick={() => setPill(category)}
              key={category}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${
                pill === category
                  ? "bg-[#2d6a1b] text-white"
                  : "bg-[#eae8e2] text-[#41493c]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Documents + Insights */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Documents */}
        <div className="space-y-4 lg:col-span-8">
          {list.length > 0 ? (
            list.map((doc, i) => (
              <article
                key={doc.name}
                className="flex flex-col justify-between gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-center"
              >
                <div className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#f5f3ee] text-[#2d6a1b]">
                    <Icon
                      name={
                        i === 1
                          ? "book"
                          : "card"
                      }
                      className="size-6"
                    />
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {doc.name}
                      </h2>

                      <span className="rounded-full bg-[#b4f48a] px-2 py-0.5 text-[11px] font-bold text-[#3a7117]">
                        ✓ Processed
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#41493c]">
                      {doc.uploaded}
                    </p>

                    <p className="mt-2 text-[13px] font-semibold text-[#2d6a1b]">
                      ✦ {doc.insight}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-end md:self-auto">
                  <Link
                    href="/ask-ai"
                    className="rounded-lg bg-[#2d6a1b] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Ask AI
                  </Link>

                  <Link
                    href="/flashcards"
                    className="rounded-lg bg-[#b4f48a] px-3 py-2 text-sm font-semibold text-[#215100]"
                  >
                    Flashcards
                  </Link>

                  <button
                    type="button"
                    aria-label={`Delete ${doc.name}`}
                    onClick={() =>
                      deleteDocument(doc.name)
                    }
                    className="p-2 text-[#717a6b] hover:text-[#93000a]"
                  >
                    <Icon
                      name="trash"
                      className="size-5"
                    />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-lg font-semibold">
                No materials found
              </h2>

              <p className="mt-2 text-sm text-[#717a6b]">
                Try another search or category.
              </p>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-xl bg-[#f0eee8] p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              Study Rhythm & AI Insights
            </h2>

            <div className="mt-4 rounded-xl bg-white p-4">
              <b className="text-[#2d6a1b]">
                ⚡ 5 day study streak
              </b>

              <p className="mt-2 text-sm leading-6 text-[#41493c]">
                Reviewing{" "}
                <strong>
                  Lecture 03
                </strong>{" "}
                flashcards within 24 hours boosts
                long-term retention by{" "}
                <strong>60%</strong>.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white p-3">
                <b className="text-xl text-[#2d6a1b]">
                  82%
                </b>

                <p className="text-[11px] text-[#41493c]">
                  Readiness
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <b className="text-xl text-[#895000]">
                  44
                </b>

                <p className="text-[11px] text-[#41493c]">
                  Flashcards
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Study Science Tip */}
      <section className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-[#ffdcbe] text-xl">
            💡
          </span>

          <div>
            <h2 className="font-semibold">
              Study Science Tip
            </h2>

            <p className="text-sm text-[#41493c]">
              Regular active recall improves exam
              scores by up to{" "}
              <b className="text-[#2d6a1b]">
                40%
              </b>
              . Keep going!
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl bg-[#eae8e2] px-4 py-2 text-sm font-semibold"
        >
          Read the Science
        </button>
      </section>
    </>
  );
}
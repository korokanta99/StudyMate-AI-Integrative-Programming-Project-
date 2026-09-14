"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

import Icon from "@/components/ui/Icon";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type FlashcardDeck = {
  deckId: string;
  title: string;
  materialId: string;
  materialName: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
};

type Material = {
  materialId: string;
  name: string;
  extractedText?: string;
  status?: string;
  pageCount?: number;
};

function getTopBarClass() {
  return "bg-[#468432]";
}

function getButtonClass() {
  return "bg-[#468432] text-white";
}

function getMasteryLabel() {
  return "New deck";
}

function getMasteryCount(deck: FlashcardDeck) {
  return `0/${deck.cardCount} known`;
}

function getBottomLabel() {
  return "Ready to start";
}

type FlashcardCardProps = {
  deck: FlashcardDeck;
  menuOpen: boolean;
  onToggleMenu: (deckId: string) => void;
  onReview: (deckId: string) => void;
  onDelete: (deck: FlashcardDeck) => void;
};

function FlashcardCard({
  deck,
  menuOpen,
  onToggleMenu,
  onReview,
  onDelete,
}: FlashcardCardProps) {
  return (
    <article className="relative flex min-h-72 flex-col justify-between overflow-visible rounded-2xl bg-white p-5 shadow-sm">
      {/* Top accent */}
      <i
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl ${getTopBarClass()}`}
      />

      <div>
        {/* Card header */}
        <div className="flex items-start justify-between">
          <span className="grid size-8 place-items-center rounded-lg bg-[#f0eee8] text-[#2d6a1b]">
            <Icon name="card" className="size-5" />
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => onToggleMenu(deck.deckId)}
              className="grid size-9 place-items-center rounded-lg text-[#41493c] transition hover:bg-[#f5f3ee]"
              aria-label="Flashcard deck options"
              aria-expanded={menuOpen}
            >
              <span className="text-xl leading-none">⋮</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-[#e3dfd7] bg-white p-1.5 shadow-[0_12px_35px_rgba(0,0,0,.12)]">
                {/* Review */}
                <button
                  type="button"
                  onClick={() => onReview(deck.deckId)}
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#41493c] transition hover:bg-[#f5f3ee]"
                >
                  ▶ Review
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDelete(deck)}
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#dc2626] transition hover:bg-[#fff1f1]"
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card count */}
        <div className="mt-3">
          <span className="rounded-full bg-[#eae8e2] px-2 py-1 text-[11px] font-bold text-[#41493c]">
            {deck.cardCount} cards
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-5 text-lg font-semibold">{deck.title}</h2>

        <p className="mt-1 text-sm text-[#41493c]">
          Generated from {deck.materialName}
        </p>

        {/* Mastery */}
        <div className="mt-5 rounded-xl bg-[#f5f3ee] p-3">
          <div className="flex justify-between text-[11px] font-bold">
            <span>{getMasteryLabel()}</span>

            <span className="text-[#2d6a1b]">{getMasteryCount(deck)}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4e2dd]">
            <i
              className="block h-full rounded-full bg-[#99d771]"
              style={{
                width: "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#41493c]">
          {getBottomLabel()}
        </span>

        <button
          type="button"
          onClick={() => onReview(deck.deckId)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${getButtonClass()}`}
        >
          ▶ Review
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
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search flashcard decks..."
        className="w-full rounded-xl bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
      />
    </div>
  );
}

export default function FlashcardsView() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedMaterialId, setSelectedMaterialId] =
    useState("all");

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

  const [materials, setMaterials] = useState<Material[]>([]);

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);

  const [showGenerateModal, setShowGenerateModal] =
    useState(false);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<FlashcardDeck | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  async function getToken() {
    const session = await fetchAuthSession();

    const token = session.tokens?.accessToken?.toString();

    if (!token) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    return token;
  }

  async function loadDecks() {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch(`${API_BASE}/flashcards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load flashcard decks."
        );
      }

      setDecks(
        Array.isArray(data.decks)
          ? data.decks
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load flashcard decks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMaterials() {
    try {
      const token = await getToken();

      const response = await fetch(`${API_BASE}/materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load materials."
        );
      }

      setMaterials(
        Array.isArray(data.materials)
          ? data.materials
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load materials."
      );
    }
  }

  async function handleOpenGenerate() {
    setError("");

    await loadMaterials();

    setShowGenerateModal(true);
  }

  async function handleGenerate(materialId: string) {
    try {
      setGenerating(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `${API_BASE}/flashcards/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to generate flashcards."
        );
      }

      setShowGenerateModal(false);

      await loadDecks();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate flashcards."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* Delete */
  function handleDelete(deck: FlashcardDeck) {
    setOpenMenuId(null);
    setDeleteTarget(deck);
    setError("");
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `${API_BASE}/flashcards/${deleteTarget.deckId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete flashcard deck."
        );
      }

      setDecks((current) =>
        current.filter(
          (deck) =>
            deck.deckId !== deleteTarget.deckId
        )
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete flashcard deck."
      );
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadDecks();
  }, []);

  const filteredDecks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return decks.filter((deck) => {
      const matchesSearch =
        !query ||
        deck.title.toLowerCase().includes(query) ||
        deck.materialName.toLowerCase().includes(query);

      const matchesMaterial =
        selectedMaterialId === "all" ||
        deck.materialId === selectedMaterialId;

      return matchesSearch && matchesMaterial;
    });
  }, [
    decks,
    searchQuery,
    selectedMaterialId,
  ]);

  const totalCards = decks.reduce(
    (total, deck) => total + deck.cardCount,
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
          onClick={handleOpenGenerate}
          className="rounded-xl bg-[#ffdcbe] px-5 py-3 text-sm font-semibold text-[#2c1600]"
        >
          ✦ Generate from Material
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a52a1f]">
          {error}
        </div>
      )}

      {/* Search / Filter Bar */}
      <div className="mt-7 flex flex-col gap-3 rounded-xl bg-[#f0eee8] p-4 sm:flex-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <select
          value={selectedMaterialId}
          onChange={(event) =>
            setSelectedMaterialId(event.target.value)
          }
          className="rounded-xl bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#468432]"
        >
          <option value="all">All materials</option>

          {materials.map((material) => (
            <option
              key={material.materialId}
              value={material.materialId}
            >
              {material.name}
            </option>
          ))}
        </select>

        <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#2d6a1b]">
          {totalCards} cards
        </span>
      </div>

      {/* Flashcard Decks */}
      {loading ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#41493c]">
            Loading your flashcard decks...
          </p>
        </div>
      ) : filteredDecks.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDecks.map((deck) => (
            <FlashcardCard
              key={deck.deckId}
              deck={deck}
              menuOpen={openMenuId === deck.deckId}
              onToggleMenu={(deckId) =>
                setOpenMenuId(
                  openMenuId === deckId
                    ? null
                    : deckId
                )
              }
              onReview={(deckId) =>
                router.push(
                  `/flashcards/${deckId}`
                )
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#f0eee8] text-[#2d6a1b]">
            <Icon name="card" className="size-6" />
          </div>

          <h2 className="mt-4 font-semibold">
            No flashcard decks yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-[#41493c]">
            Upload course material first.
            StudyMate AI will generate
            flashcards from your uploaded
            materials.
          </p>

          <button
            type="button"
            onClick={handleOpenGenerate}
            className="mt-5 rounded-xl bg-[#468432] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ✦ Generate Flashcards
          </button>
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
            Generated from your uploaded
            course notes
          </h2>

          <p className="mt-1 text-sm text-[#41493c]">
            StudyMate AI continuously
            aligns questions with your
            uploaded study materials.
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="grid size-16 place-items-center rounded-full border-4 border-[#2d6a1b] font-bold text-[#2d6a1b]">
            0%
          </span>

          <div>
            <b>Weekly Goal Progress</b>

            <p className="text-sm text-[#41493c]">
              No cards retained yet
            </p>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Generate Flashcards
                </h2>

                <p className="mt-1 text-sm text-[#41493c]">
                  Choose an uploaded material
                  for StudyMate AI to generate
                  flashcards from.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowGenerateModal(false)
                }
                className="rounded-lg px-2 py-1 text-lg text-[#717a6b] hover:bg-[#f5f3ee]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 max-h-80 space-y-2 overflow-y-auto">
              {materials.length === 0 ? (
                <div className="rounded-xl bg-[#f5f3ee] p-5 text-center">
                  <p className="text-sm text-[#41493c]">
                    No uploaded materials
                    available.
                  </p>
                </div>
              ) : (
                materials.map((material) => {
                  const hasText = Boolean(
                    material.extractedText?.trim()
                  );

                  return (
                    <div
                      key={material.materialId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e4e2dd] p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {material.name}
                        </p>

                        <p className="mt-1 text-xs text-[#717a6b]">
                          {material.pageCount
                            ? `${material.pageCount} pages`
                            : "Uploaded material"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          !hasText ||
                          generating
                        }
                        onClick={() =>
                          handleGenerate(
                            material.materialId
                          )
                        }
                        className="shrink-0 rounded-lg bg-[#468432] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {generating
                          ? "Generating..."
                          : "Generate"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.2)]">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff1f1] text-[#dc2626]">
                <span className="text-lg">
                  🗑
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Delete flashcards?
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#41493c]">
                  Delete "{deleteTarget.title}"?
                </p>

                <p className="mt-2 text-xs leading-5 text-[#717a6b]">
                  This will permanently delete
                  this flashcard deck and its
                  cards.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-xl border border-[#e3dfd7] px-4 py-2.5 text-sm font-semibold text-[#41493c] transition hover:bg-[#f5f3ee] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
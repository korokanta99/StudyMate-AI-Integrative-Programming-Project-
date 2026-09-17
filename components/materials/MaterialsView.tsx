"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE =
  "https://8auzzcojhh.execute-api.ap-southeast-1.amazonaws.com";

type FilterType = "all" | "pdf" | "docs" | "ppt";

type Material = {
  id?: string;
  materialId?: string;
  fileName?: string;
  filename?: string;
  name?: string;
  title?: string;
  key?: string;
  s3Key?: string;
  size?: number;
  sizeMb?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  contentType?: string;
  pageCount?: number;
  extractedText?: string;
};

function getMaterialName(material: Material) {
  return (
    material.fileName ||
    material.filename ||
    material.name ||
    material.title ||
    material.key?.split("/").pop() ||
    material.s3Key?.split("/").pop() ||
    "Untitled material"
  );
}

function getMaterialId(material: Material) {
  return material.materialId || material.id || "";
}

function getMaterialKey(
  material: Material,
  index: number
) {
  const materialId = getMaterialId(material);

  if (materialId) {
    return materialId;
  }

  const name = getMaterialName(material)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);

  const date =
    material.createdAt ||
    material.updatedAt ||
    "unknown";

  return `material-${name}-${date}-${index}`;
}

function getFileExtension(fileName: string) {
  return (
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() ?? ""
  );
}

function getFileType(
  material: Material
): FilterType {
  const fileName = getMaterialName(material);
  const extension = getFileExtension(fileName);
  const contentType =
    material.contentType?.toLowerCase() ?? "";

  if (
    extension === "pdf" ||
    contentType === "application/pdf"
  ) {
    return "pdf";
  }

  if (
    extension === "docx" ||
    extension === "txt" ||
    contentType === "text/plain" ||
    contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docs";
  }

  if (
    extension === "pptx" ||
    contentType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "ppt";
  }

  return "docs";
}

function getFileIcon(material: Material) {
  const type = getFileType(material);

  if (type === "pdf") {
    return "PDF";
  }

  if (type === "ppt") {
    return "PPT";
  }

  return "DOC";
}

function getSizeMb(material: Material) {
  if (
    typeof material.sizeMb === "number" &&
    material.sizeMb >= 0
  ) {
    return material.sizeMb;
  }

  if (
    typeof material.size === "number" &&
    material.size > 0
  ) {
    return material.size / (1024 * 1024);
  }

  return 0;
}

function formatFileSize(material: Material) {
  const sizeMb = getSizeMb(material);

  if (sizeMb <= 0) {
    return "0 MB";
  }

  if (sizeMb < 1) {
    return `${Math.round(sizeMb * 1024)} KB`;
  }

  return `${sizeMb.toFixed(2)} MB`;
}

function formatDate(date?: string) {
  if (!date) {
    return "Recently uploaded";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently uploaded";
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function MaterialsView() {
  const router = useRouter();

  const [docs, setDocs] =
    useState<Material[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState("last-uploaded");

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [generatingId, setGeneratingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [uploadMessage, setUploadMessage] =
    useState("");

  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState<Material | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* Auth */
  async function getAccessToken() {
    const session =
      await fetchAuthSession();

    return (
      session.tokens?.accessToken?.toString() ??
      ""
    );
  }

  /* Load */
  async function loadMaterials() {
    try {
      setLoading(true);

      const token =
        await getAccessToken();

      if (!token) {
        setDocs([]);
        return;
      }

      const response =
        await fetch(
          `${API_BASE}/materials`,
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
            `Failed to load materials: ${response.status}`
        );
      }

      const materials =
        Array.isArray(data)
          ? data
          : Array.isArray(data.materials)
            ? data.materials
            : [];

      setDocs(materials);
    } catch (error) {
      console.error(
        "Failed to load materials:",
        error
      );

      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  /* Upload */
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      getFileExtension(file.name);

    const supportedTypes = [
      "pdf",
      "docx",
      "pptx",
      "txt",
    ];

    if (!supportedTypes.includes(extension)) {
      setUploadMessage(
        "Supported files: PDF, DOCX, PPTX, and TXT."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "You are not signed in."
        );
      }

      const contentType =
        file.type ||
        "application/octet-stream";

      /* Upload URL */
      const uploadUrlResponse =
        await fetch(
          `${API_BASE}/materials/upload-url`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              fileName: file.name,
              contentType,
              size: file.size,
            }),
          }
        );

      const uploadUrlData =
        await uploadUrlResponse
          .json()
          .catch(() => ({}));

      if (!uploadUrlResponse.ok) {
        throw new Error(
          uploadUrlData.message ||
            `Unable to prepare upload: ${uploadUrlResponse.status}`
        );
      }

      const uploadUrl =
        uploadUrlData.uploadUrl;

      const materialId =
        uploadUrlData.materialId;

      const s3Key =
        uploadUrlData.key;

      if (
        !uploadUrl ||
        !materialId ||
        !s3Key
      ) {
        throw new Error(
          "The upload API returned an incomplete response."
        );
      }

      /* S3 */
      const s3Response =
        await fetch(
          uploadUrl,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                contentType,
            },
            body: file,
          }
        );

      if (!s3Response.ok) {
        throw new Error(
          `S3 upload failed: ${s3Response.status}`
        );
      }

      /* Complete */
      const sizeMb =
        file.size /
        (1024 * 1024);

      const completeResponse =
        await fetch(
          `${API_BASE}/materials/complete`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              materialId,
              fileName: file.name,
              key: s3Key,
              sizeMb: Number(
                sizeMb.toFixed(2)
              ),
            }),
          }
        );

      const completeData =
        await completeResponse
          .json()
          .catch(() => ({}));

      if (!completeResponse.ok) {
        throw new Error(
          completeData.message ||
            `Unable to complete upload: ${completeResponse.status}`
        );
      }

      setUploadMessage(
        "Upload complete. Your material is now being processed."
      );

      await loadMaterials();
    } catch (error) {
      console.error(
        "Material upload failed:",
        error
      );

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  /* Generate Flashcards */
  async function handleGenerateFlashcards(
    material: Material
  ) {
    const materialId =
      getMaterialId(material);

    if (!materialId) {
      setUploadMessage(
        "This material cannot generate flashcards because its ID is missing."
      );

      return;
    }

    const hasExtractedText =
      typeof material.extractedText ===
        "string" &&
      material.extractedText.trim()
        .length > 0;

    if (!hasExtractedText) {
      setOpenMenuId(null);

      setUploadMessage(
        "This material is still being processed. Please try again when text extraction is complete."
      );

      return;
    }

    /* Prevent double click */
    if (generatingId === materialId) {
      return;
    }

    try {
      setGeneratingId(materialId);
      setOpenMenuId(null);
      setUploadMessage(
        "Generating flashcards from your material..."
      );

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "You are not signed in."
        );
      }

      const response =
        await fetch(
          `${API_BASE}/flashcards/generate`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              materialId,
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
            `Flashcard generation failed: ${response.status}`
        );
      }

      // The API returns deckId at the top level.
      // Keep the nested fallback for compatibility with older responses.
      const deckId =
        data?.deckId ??
        data?.deck?.deckId ??
        data?.result?.deckId;

      if (!deckId) {
        console.error(
          "Flashcard generation response did not contain a deckId:",
          data
        );

        throw new Error(
          "Flashcard generation succeeded, but no deck ID was returned."
        );
      }

      router.push(
        `/flashcards/${deckId}`
      );
    } catch (error) {
      console.error(
        "Flashcard generation failed:",
        error
      );

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate flashcards. Please try again."
      );
    } finally {
      setGeneratingId(null);
    }
  }

  /* Delete */
  async function handleDelete(
    material: Material
  ) {
    const materialId =
      getMaterialId(material);

    if (!materialId) {
      setUploadMessage(
        "This material cannot be deleted because its ID is missing."
      );

      return;
    }

    const name =
      getMaterialName(material);

    const confirmed =
      window.confirm(
        `Delete "${name}"?\n\nThis will remove the material from StudyMate and secure storage.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(materialId);
      setOpenMenuId(null);
      setUploadMessage("");

      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "You are not signed in."
        );
      }

      const response =
        await fetch(
          `${API_BASE}/materials/${encodeURIComponent(
            materialId
          )}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Delete failed: ${response.status}`
        );
      }

      setDocs((current) =>
        current.filter(
          (doc) =>
            getMaterialId(doc) !==
            materialId
        )
      );

      setUploadMessage(
        `"${name}" was deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Material delete failed:",
        error
      );

      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Delete failed. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* View Extracted Text */
  function handleViewExtractedText(
    material: Material
  ) {
    setOpenMenuId(null);
    setSelectedMaterial(material);
  }

  /* Filters */
  const filteredDocs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const result =
        docs.filter((doc) => {
          const name =
            getMaterialName(doc)
              .toLowerCase();

          if (
            query &&
            !name.includes(query)
          ) {
            return false;
          }

          if (
            filter !== "all" &&
            getFileType(doc) !==
              filter
          ) {
            return false;
          }

          return true;
        });

      return [...result].sort(
        (a, b) => {
          if (sort === "name") {
            return getMaterialName(
              a
            ).localeCompare(
              getMaterialName(b)
            );
          }

          const dateA =
            a.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

          const dateB =
            b.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

          if (sort === "oldest") {
            return dateA - dateB;
          }

          return dateB - dateA;
        }
      );
    }, [
      docs,
      filter,
      search,
      sort,
    ]);

  /* Counts */
  const pdfCount =
    docs.filter(
      (doc) =>
        getFileType(doc) ===
        "pdf"
    ).length;

  const docsCount =
    docs.filter(
      (doc) =>
        getFileType(doc) ===
        "docs"
    ).length;

  const pptCount =
    docs.filter(
      (doc) =>
        getFileType(doc) ===
        "ppt"
    ).length;

  /* Processing */
  const processedCount =
    docs.filter(
      (doc) =>
        doc.status ===
        "TEXT_EXTRACTED"
    ).length;

  const processedPercentage =
    docs.length > 0
      ? Math.round(
          (processedCount /
            docs.length) *
            100
        )
      : 0;

  /* Storage */
  const storageMB =
    docs.reduce(
      (total, doc) =>
        total +
        getSizeMb(doc),
      0
    );

  const storagePercentage =
    Math.min(
      (storageMB / 50) * 100,
      100
    );

  return (
    <div className="mx-auto max-w-[1200px]">

      {/* Header */}
      <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(70,132,50,.08)] sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#b4f48a] px-3 py-1 text-[11px] font-bold text-[#215100]">
                WORKSPACE VAULT
              </span>

              <span className="text-xs font-semibold text-[#2d6a1b]">
                • AI SYNC ACTIVE
              </span>
            </div>

            <h1 className="mt-4 text-[32px] font-bold tracking-tight">
              Your Study Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#41493c]">
              {docs.length}{" "}
              {docs.length === 1
                ? "document"
                : "documents"}{" "}
              uploaded

              <span className="mx-1 text-[#2d6a1b]">
                •
              </span>

              {processedPercentage}% processed

              <span className="mx-1 text-[#2d6a1b]">
                •
              </span>

              Storage:{" "}
              {storageMB.toFixed(2)}
              {" "}MB / 50 MB
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Capacity */}
            <div className="hidden w-36 rounded-xl bg-[#f5f3ee] p-2.5 sm:block">
              <div className="flex items-center justify-between text-[11px]">
                <span>
                  Vault Cap
                </span>

                <span className="font-bold text-[#2d6a1b]">
                  {Math.round(
                    storagePercentage
                  )}
                  %
                </span>
              </div>

              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e1dfd8]">
                <div
                  className="h-full rounded-full bg-[#468432]"
                  style={{
                    width: `${storagePercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Upload */}
            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="rounded-xl bg-[#ffd9b8] px-5 py-3 text-sm font-semibold text-[#1b1c19] transition hover:bg-[#ffcca3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Uploading..."
                : "+ Upload Material"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Message */}
        {uploadMessage && (
          <p className="mt-5 rounded-xl bg-[#f0eee8] p-3 text-sm text-[#41493c]">
            {uploadMessage}
          </p>
        )}
      </section>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

        <div className="flex flex-1 items-center rounded-xl bg-white px-4 shadow-sm">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-5 shrink-0 text-[#717a6b]"
          >
            <circle
              cx="11"
              cy="11"
              r="6.5"
            />

            <path d="m16 16 4 4" />
          </svg>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search uploaded documents, summaries, topics..."
            className="w-full bg-transparent px-3 py-4 text-sm outline-none placeholder:text-[#9b9f97]"
          />
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target.value
            )
          }
          className="rounded-xl bg-white px-4 py-4 text-sm outline-none shadow-sm"
        >
          <option value="last-uploaded">
            Last uploaded
          </option>

          <option value="oldest">
            Oldest uploaded
          </option>

          <option value="name">
            Name
          </option>
        </select>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() =>
            setFilter("all")
          }
          className={`rounded-full px-4 py-2 text-sm transition ${
            filter === "all"
              ? "bg-[#2d6a1b] text-white"
              : "bg-[#eae8e2] text-[#41493c] hover:bg-[#dedbd3]"
          }`}
        >
          All ({docs.length})
        </button>

        <button
          type="button"
          onClick={() =>
            setFilter("pdf")
          }
          className={`rounded-full px-4 py-2 text-sm transition ${
            filter === "pdf"
              ? "bg-[#2d6a1b] text-white"
              : "bg-[#eae8e2] text-[#41493c] hover:bg-[#dedbd3]"
          }`}
        >
          PDF ({pdfCount})
        </button>

        <button
          type="button"
          onClick={() =>
            setFilter("docs")
          }
          className={`rounded-full px-4 py-2 text-sm transition ${
            filter === "docs"
              ? "bg-[#2d6a1b] text-white"
              : "bg-[#eae8e2] text-[#41493c] hover:bg-[#dedbd3]"
          }`}
        >
          Docs / Notes ({docsCount})
        </button>

        <button
          type="button"
          onClick={() =>
            setFilter("ppt")
          }
          className={`rounded-full px-4 py-2 text-sm transition ${
            filter === "ppt"
              ? "bg-[#2d6a1b] text-white"
              : "bg-[#eae8e2] text-[#41493c] hover:bg-[#dedbd3]"
          }`}
        >
          PPT ({pptCount})
        </button>
      </div>

      {/* Materials */}
      <div className="mt-6 space-y-4">

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-[#717a6b]">
              Loading your materials...
            </p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto grid size-14 place-items-center rounded-xl bg-[#f0eee8]">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-7 text-[#468432]"
              >
                <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3V4.5Z" />
                <path d="M5 19.5h14" />
              </svg>

            </div>

            <h2 className="mt-4 text-lg font-semibold">
              {docs.length === 0
                ? "No materials uploaded yet"
                : "No matching materials"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#717a6b]">
              {docs.length === 0
                ? "Upload your course materials to start building your StudyMate workspace."
                : "Try another search or file type."}
            </p>

          </div>
        ) : (
          filteredDocs.map(
            (doc, index) => {
              const name =
                getMaterialName(doc);

              const materialId =
                getMaterialId(doc);

              const materialKey =
                getMaterialKey(
                  doc,
                  index
                );

              const isProcessed =
                doc.status ===
                "TEXT_EXTRACTED";

              const hasExtractedText =
                typeof doc.extractedText ===
                  "string" &&
                doc.extractedText.trim()
                  .length > 0;

              const isDeleting =
                !!materialId &&
                deletingId ===
                  materialId;

              const isGenerating =
                !!materialId &&
                generatingId ===
                  materialId;

              const menuOpen =
                openMenuId ===
                materialKey;

              return (
                <article
                  key={materialKey}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-[0_8px_30px_rgba(70,132,50,.08)] sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f5f3ee]">
                        <span className="text-[10px] font-bold text-[#2d6a1b]">
                          {getFileIcon(
                            doc
                          )}
                        </span>
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="truncate font-semibold">
                            {name}
                          </h2>

                          <span className="rounded-full bg-[#ffd9b8] px-2 py-1 text-[10px] font-bold text-[#8a4b14]">
                            Upload Complete
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-[#41493c]">
                          Uploaded{" "}
                          {formatDate(
                            doc.createdAt
                          )}
                          {" • "}
                          {formatFileSize(
                            doc
                          )}
                        </p>

                        <p className="mt-2 text-xs text-[#2d6a1b]">
                          ✦ Uploaded to secure storage
                          {" • "}
                          {isProcessed
                            ? "Text extracted"
                            : "Processing pending"}
                        </p>

                      </div>
                    </div>

                    {/* Menu */}
                    <div className="relative shrink-0">

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(
                            menuOpen
                              ? null
                              : materialKey
                          )
                        }
                        className="grid size-10 place-items-center rounded-xl border border-[#e3dfd7] bg-white text-[#41493c] transition hover:bg-[#f5f3ee]"
                        aria-label="Material options"
                      >
                        <span className="text-xl leading-none">
                          ⋮
                        </span>
                      </button>

                      {menuOpen && (
                        <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-[#e3dfd7] bg-white p-1.5 shadow-[0_12px_35px_rgba(0,0,0,.12)]">

                          {/* Ask AI */}
                          <button
                            type="button"
                            disabled
                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#717a6b] opacity-60"
                          >
                            ✦ Ask AI
                          </button>

                          {/* Generate Flashcards */}
                          <button
                            type="button"
                            disabled={
                              !hasExtractedText ||
                              isGenerating
                            }
                            onClick={() =>
                              handleGenerateFlashcards(
                                doc
                              )
                            }
                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#41493c] transition hover:bg-[#f5f3ee] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isGenerating
                              ? "Generating..."
                              : "✦ Generate Flashcards"}
                          </button>

                          {/* View Extracted Text */}
                          <button
                            type="button"
                            disabled={
                              !hasExtractedText
                            }
                            onClick={() =>
                              handleViewExtractedText(
                                doc
                              )
                            }
                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#41493c] transition hover:bg-[#f5f3ee] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            View Extracted Text
                          </button>

                          <div className="my-1 border-t border-[#eeeae3]" />

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={
                              !materialId ||
                              isDeleting
                            }
                            onClick={() =>
                              handleDelete(
                                doc
                              )
                            }
                            className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#dc2626] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            🗑 Delete
                          </button>

                        </div>
                      )}

                    </div>

                  </div>
                </article>
              );
            }
          )
        )}

      </div>

      {/* Info */}
      <section className="mt-8 rounded-2xl bg-[#f0eee8] p-5 sm:p-6">

        <h2 className="text-xl font-semibold">
          StudyMate AI
        </h2>

        <div className="mt-4 rounded-xl bg-white p-5">

          <h3 className="font-semibold text-[#2d6a1b]">
            ✦ Your materials are connected
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#41493c]">
            Uploaded files are securely
            stored and processed for
            future AI-powered study
            tools.
          </p>

        </div>
      </section>

      {/* Extracted Text Viewer */}
      {selectedMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedMaterial(null)
          }
        >
          <div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,.2)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Viewer Header */}
            <div className="flex items-center justify-between border-b border-[#eeeae3] px-5 py-4 sm:px-6">

              <div className="min-w-0">
                <div className="flex items-center gap-2">

                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0eee8] text-[9px] font-bold text-[#2d6a1b]">
                    {getFileIcon(
                      selectedMaterial
                    )}
                  </span>

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {getMaterialName(
                        selectedMaterial
                      )}
                    </h2>

                    <p className="text-xs text-[#717a6b]">
                      Extracted text
                      {selectedMaterial.pageCount
                        ? ` • ${selectedMaterial.pageCount} pages`
                        : ""}
                    </p>
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMaterial(null)
                }
                className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-[#717a6b] transition hover:bg-[#f5f3ee] hover:text-[#1b1c19]"
                aria-label="Close extracted text"
              >
                ×
              </button>

            </div>

            {/* Extracted Text */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f6] px-5 py-5 sm:px-7 sm:py-6">

              {selectedMaterial.extractedText?.trim() ? (
                <div className="rounded-xl bg-white p-5 shadow-sm sm:p-7">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#2f332c]">
                    {
                      selectedMaterial.extractedText
                    }
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#f0eee8]">
                      <span className="text-xl">
                        📄
                      </span>
                    </div>

                    <h3 className="mt-4 font-semibold">
                      Text not available yet
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#717a6b]">
                      StudyMate is still
                      processing this material.
                      Try again after processing
                      finishes.
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* Viewer Footer */}
            <div className="flex items-center justify-between border-t border-[#eeeae3] px-5 py-3 sm:px-6">

              <p className="text-xs text-[#717a6b]">
                {selectedMaterial.extractedText
                  ? `${selectedMaterial.extractedText.length.toLocaleString()} characters`
                  : "No extracted text"}
              </p>

              <button
                type="button"
                onClick={() =>
                  setSelectedMaterial(null)
                }
                className="rounded-xl bg-[#2d6a1b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#245516]"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
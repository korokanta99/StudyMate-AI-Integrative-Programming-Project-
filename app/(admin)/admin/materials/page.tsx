"use client";

import { useEffect, useState } from "react";

import { adminFetch } from "@/components/auth/AdminAuth";

type AdminMaterial = {
  id: string;
  fileName?: string;
  name?: string;
  ownerEmail?: string;
  ownerName?: string;
  sizeBytes?: number;
  uploadedAt?: string;
};

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";

  const mb = bytes / (1024 * 1024);

  return `${mb.toFixed(2)} MB`;
}

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<AdminMaterial[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMaterials() {
      try {
        setLoading(true);
        setError("");

        const response = await adminFetch("/admin/materials");

        if (!response.ok) {
          throw new Error(
            `Failed to load materials (${response.status}).`
          );
        }

        const data = await response.json();

        setMaterials(
          Array.isArray(data) ? data : data.materials ?? []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load materials."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMaterials();
  }, []);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#2d6a1b]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#263021]">
          Materials
        </h1>

        <p className="mt-2 text-[#697064]">
          Study materials stored across all users, for moderation
          and storage oversight. Ask AI / flashcard generation
          stays on the student-facing app.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#e5e1d7] bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-[#697064]">
            Loading materials…
          </div>
        ) : materials.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#697064]">
            No materials found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e1d7] bg-[#f5f3ee] text-xs uppercase tracking-wide text-[#697064]">
              <tr>
                <th className="px-5 py-3">File</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Uploaded</th>
              </tr>
            </thead>

            <tbody>
              {materials.map((material) => (
                <tr
                  key={material.id}
                  className="border-b border-[#f0eee9] last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-[#263021]">
                    {material.fileName || material.name || "—"}
                  </td>

                  <td className="px-5 py-3 text-[#41493c]">
                    {material.ownerName ||
                      material.ownerEmail ||
                      "—"}
                  </td>

                  <td className="px-5 py-3 text-[#697064]">
                    {formatSize(material.sizeBytes)}
                  </td>

                  <td className="px-5 py-3 text-[#697064]">
                    {material.uploadedAt
                      ? new Date(
                          material.uploadedAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

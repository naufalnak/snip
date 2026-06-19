"use client";

import { useState } from "react";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

interface ClickData {
  date: string;
  count: number;
}

interface Props {
  link: Link;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, newSlug: string) => void;
}

export default function LinkCard({ link, onDeleted, onUpdated }: Props) {
  const [analytics, setAnalytics] = useState<ClickData[] | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editSlug, setEditSlug] = useState(link.slug);
  const [editError, setEditError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const shortUrl = `${window.location.origin}/${link.slug}`;
  const maxCount = analytics
    ? Math.max(...analytics.map((d) => d.count), 1)
    : 1;

  async function toggleAnalytics() {
    if (analytics) {
      setAnalytics(null);
      return;
    }
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/links/${link.id}/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleEditSave() {
    setEditError("");
    if (editSlug === link.slug) {
      setIsEditing(false);
      return;
    }

    setLoadingEdit(true);
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error ?? "Gagal mengupdate slug");
        return;
      }

      onUpdated(link.id, data.slug);
      setIsEditing(false);
    } catch {
      setEditError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoadingEdit(false);
    }
  }

  function handleEditCancel() {
    setEditSlug(link.slug);
    setEditError("");
    setIsEditing(false);
  }

  async function handleDelete() {
    setLoadingDelete(true);
    try {
      await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      onDeleted(link.id);
    } catch {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Edit mode */}
          {isEditing ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-400">domain.com/</span>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-gray-500 w-36 transition"
                  autoFocus
                />
              </div>
              {editError && <p className="text-xs text-red-500">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  disabled={loadingEdit || !editSlug}
                  className="text-xs bg-gray-900 text-white rounded-lg px-3 py-1 disabled:opacity-40 hover:bg-gray-700 transition">
                  {loadingEdit ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={handleEditCancel}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 transition">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  /{link.slug}
                </span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {link._count.clicks} klik
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {link.originalUrl}
              </p>
            </>
          )}
        </div>

        {/* Action buttons — sembunyiin saat edit mode */}
        {!isEditing && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={copyToClipboard}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              {copied ? "Tersalin!" : "Salin"}
            </button>
            <button
              onClick={toggleAnalytics}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              {analytics ? "Tutup" : "Statistik"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              Edit
            </button>
            {confirmDelete ? (
              <div className="flex gap-1">
                <button
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  className="text-xs bg-red-500 text-white rounded-lg px-3 py-1.5 hover:bg-red-600 disabled:opacity-40 transition">
                  {loadingDelete ? "..." : "Yakin?"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs border border-red-200 text-red-400 rounded-lg px-3 py-1.5 hover:bg-red-50 transition">
                Hapus
              </button>
            )}
          </div>
        )}
      </div>

      {/* Analytics chart */}
      {loadingAnalytics && (
        <p className="text-xs text-gray-400">Memuat statistik...</p>
      )}
      {analytics && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Klik 7 hari terakhir</p>
          <div className="flex items-end gap-1 h-16">
            {analytics.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{d.count}</span>
                <div
                  className="w-full bg-gray-900 rounded-sm"
                  style={{
                    height: `${Math.max((d.count / maxCount) * 48, d.count > 0 ? 4 : 0)}px`,
                  }}
                />
                <span className="text-[10px] text-gray-400">
                  {new Date(d.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

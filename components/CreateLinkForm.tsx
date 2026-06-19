"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function CreateLinkForm({ onCreated }: Props) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          customSlug: customSlug || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal membuat link");
        return;
      }

      setOriginalUrl("");
      setCustomSlug("");
      onCreated();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h2 className="font-medium text-gray-900">Shorten URL baru</h2>

      <div className="space-y-3">
        <input
          type="url"
          placeholder="https://url-panjang-kamu.com/..."
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
        />
        <div className="flex gap-2">
          <span className="flex items-center px-3 text-sm text-gray-400 border border-gray-200 border-r-0 rounded-l-lg bg-gray-50">
            domain.com/
          </span>
          <input
            type="text"
            placeholder="custom-slug (opsional)"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !originalUrl}
        className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-700 transition">
        {loading ? "Memproses..." : "Buat Short Link"}
      </button>
    </div>
  );
}

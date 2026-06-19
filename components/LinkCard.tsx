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

export default function LinkCard({ link }: { link: Link }) {
  const [analytics, setAnalytics] = useState<ClickData[] | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortUrl = `${window.location.origin}/${link.slug}`;

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

  const maxCount = analytics
    ? Math.max(...analytics.map((d) => d.count), 1)
    : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
        </div>

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
        </div>
      </div>

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

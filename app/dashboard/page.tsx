"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import CreateLinkForm from "@/components/CreateLinkForm";
import LinkCard from "@/components/LinkCard";

interface Link {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  _count: { clicks: number };
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleDeleted = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleUpdated = useCallback((id: string, newSlug: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, slug: newSlug } : l)),
    );
  }, []);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  const totalClicks = links.reduce((sum, l) => sum + l._count.clicks, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Short Links</h1>
            <p className="text-sm text-gray-400 mt-1">
              {links.length} link · {totalClicks} total klik
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600">
            Logout
          </button>
        </div>

        {/* Form */}
        <CreateLinkForm onCreated={fetchLinks} />

        {/* List */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Memuat...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Belum ada link. Buat yang pertama di atas!
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDeleted={handleDeleted}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

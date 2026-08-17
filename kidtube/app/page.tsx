"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, MoreVertical } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";

export default function Grid() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async (showSpin = false) => {
    if (showSpin) setSpinning(true);
    setError(null);
    try {
      const res = await fetch("/api/videos", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load videos");
      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
      if (showSpin) setTimeout(() => setSpinning(false), 700);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-[100dvh]">
      <header
        className="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center justify-between"
        style={{
          backgroundColor: kt.cream + "F2",
          backdropFilter: "blur(8px)",
          borderBottom: `2px dashed ${kt.teal}22`,
        }}
      >
        <Wordmark />
        <div className="flex items-center gap-2">
          <button
            aria-label="Refresh videos"
            onClick={() => void load(true)}
            className="kt-press flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, backgroundColor: kt.sun, boxShadow: `0 4px 0 ${kt.ink}26` }}
          >
            <RefreshCw
              size={26}
              color={kt.ink}
              strokeWidth={2.75}
              style={spinning ? { animation: "kt-spin-once .7s ease" } : undefined}
            />
          </button>
          <div className="relative">
            <button
              aria-label="More"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center rounded-full opacity-30 hover:opacity-70 transition-opacity"
              style={{ width: 36, height: 36 }}
            >
              <MoreVertical size={18} color={kt.inkSoft} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 rounded-xl bg-white py-1.5 whitespace-nowrap z-30"
                style={{ border: `2px solid ${kt.ink}12`, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}
              >
                <Link
                  href="/manage"
                  className="block px-4 py-2 text-sm font-bold hover:opacity-70"
                  style={{ color: kt.ink }}
                >
                  Grown-ups: manage channels
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 sm:px-8 pt-6 pb-1">
        <h1
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.6rem, 4vw, 2.3rem)",
            color: kt.ink,
            lineHeight: 1.1,
          }}
        >
          What shall we watch today?
        </h1>
        <p className="mt-1 font-bold" style={{ color: kt.inkSoft }}>
          Fresh picks from your favorite shows
        </p>
      </div>

      {error && (
        <div className="px-5 sm:px-8 pt-4 max-w-[1400px] mx-auto">
          <div
            className="rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: kt.coralSoft, color: kt.coral, border: `2px solid ${kt.coral}33` }}
          >
            {error}
          </div>
        </div>
      )}

      {loading && !error && (
        <main className="px-5 sm:px-8 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1400px] mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden animate-pulse"
              style={{ backgroundColor: "white", border: `3px solid ${kt.ink}12`, minHeight: 220 }}
            >
              <div className="aspect-video" style={{ backgroundColor: kt.creamDeep }} />
              <div className="p-4 h-16" style={{ backgroundColor: kt.cream }} />
            </div>
          ))}
        </main>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="px-5 sm:px-8 py-16 text-center max-w-lg mx-auto">
          <p className="font-extrabold text-xl" style={{ color: kt.ink }}>
            No videos yet
          </p>
          <p className="mt-2 font-semibold" style={{ color: kt.inkSoft }}>
            A grown-up can add channels from the menu (⋮). Until then, this grid stays empty on purpose.
          </p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <main className="px-5 sm:px-8 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1400px] mx-auto">
          {videos.map((v, i) => (
            <Link
              key={v.id}
              href={`/watch/${v.id}`}
              className="kt-card block text-left rounded-3xl overflow-hidden"
              style={{
                backgroundColor: "white",
                boxShadow: `0 6px 0 ${kt.ink}14`,
                border: `3px solid ${kt.ink}12`,
                animation: `kt-pop-in .5s cubic-bezier(.34,1.56,.64,1) both`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: kt.creamDeep }}>
                {v.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                ) : null}
                <div
                  className="absolute bottom-2 right-2 flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, backgroundColor: kt.coral, boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                {v.channel.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.channel.thumbnail}
                    alt={v.channel.name}
                    className="rounded-full shrink-0 object-cover"
                    style={{ width: 44, height: 44, border: `3px solid ${kt.tealSoft}` }}
                  />
                ) : (
                  <div
                    className="rounded-full shrink-0 flex items-center justify-center font-extrabold"
                    style={{
                      width: 44,
                      height: 44,
                      border: `3px solid ${kt.tealSoft}`,
                      backgroundColor: kt.tealSoft,
                      color: kt.teal,
                    }}
                  >
                    {v.channel.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className="truncate"
                    style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: kt.ink }}
                  >
                    {v.title}
                  </p>
                  <p className="text-sm font-bold truncate" style={{ color: kt.inkSoft }}>
                    {v.channel.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </main>
      )}

      <footer className="pb-10 text-center text-sm font-bold" style={{ color: kt.inkSoft + "99" }}>
        Only shows your family picked. Nothing else, ever.
      </footer>
    </div>
  );
}

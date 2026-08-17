"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Channel, Video } from "@/lib/types";
import { VideoGrid } from "@/components/VideoGrid";
import { Wordmark } from "@/components/Wordmark";

const PIN_SESSION_KEY = "kidtube_admin_pin";

export default function ChannelPreviewClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name") || "Channel";
  const thumbnail = searchParams.get("thumbnail") || "";

  const [pin, setPin] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const channel: Channel = useMemo(
    () => ({ id: id || "", name, thumbnail }),
    [id, name, thumbnail],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_SESSION_KEY);
    if (!saved) {
      router.replace("/manage");
      return;
    }
    setPin(saved);
  }, [router]);

  const load = useCallback(async () => {
    if (!pin || !id) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        id,
        name,
        thumbnail,
        pin,
      });
      const res = await fetch(`/api/channel-videos?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load videos");
      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [pin, id, name, thumbnail]);

  useEffect(() => {
    void load();
  }, [load]);

  const addChannel = async () => {
    if (!pin || !id || added || adding) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/add-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, id, name, thumbnail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setAdded(true);
      setBanner(data.message || "Channel added. Kid view updates after redeploy (~1–2 min).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add channel");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-[100dvh]">
      <header
        className="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center gap-4"
        style={{
          backgroundColor: kt.cream + "F2",
          backdropFilter: "blur(8px)",
          borderBottom: `2px dashed ${kt.teal}22`,
        }}
      >
        <Link
          href="/manage"
          className="kt-press flex items-center justify-center rounded-full shrink-0"
          style={{ width: 44, height: 44, backgroundColor: "white", border: `2px solid ${kt.ink}14` }}
          aria-label="Back to manage"
        >
          <ArrowLeft size={20} color={kt.ink} strokeWidth={2.5} />
        </Link>
        <div className="min-w-0 flex-1 flex items-center gap-3">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={name}
              className="rounded-full object-cover shrink-0"
              style={{ width: 44, height: 44, border: `3px solid ${kt.tealSoft}` }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="rounded-full shrink-0 flex items-center justify-center font-extrabold"
              style={{ width: 44, height: 44, backgroundColor: kt.tealSoft, color: kt.teal }}
            >
              {name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
              Preview · kid view
            </p>
            <h1
              className="truncate"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.25rem",
                color: kt.ink,
                lineHeight: 1.1,
              }}
            >
              {name}
            </h1>
          </div>
        </div>
        <button
          onClick={() => void addChannel()}
          disabled={added || adding}
          className="kt-press flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold shrink-0"
          style={{
            backgroundColor: added ? kt.tealSoft : kt.teal,
            color: added ? kt.teal : "white",
            opacity: adding ? 0.7 : 1,
          }}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}
          {added ? "Added" : adding ? "Adding…" : "Add"}
        </button>
      </header>

      {banner && (
        <div className="px-5 sm:px-8 pt-4 max-w-[1400px] mx-auto">
          <div
            className="rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: kt.tealSoft, color: kt.teal, border: `2px solid ${kt.teal}33` }}
          >
            {banner}
          </div>
        </div>
      )}

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

      <div className="px-5 sm:px-8 pt-6 pb-1 max-w-[1400px] mx-auto">
        <Wordmark size={22} />
        <h2
          className="mt-3"
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
            color: kt.ink,
            lineHeight: 1.1,
          }}
        >
          What shall we watch today?
        </h2>
        <p className="mt-1 font-bold" style={{ color: kt.inkSoft }}>
          Preview of how this channel looks for kids
        </p>
      </div>

      {loading && (
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
            No public uploads found
          </p>
          <p className="mt-2 font-semibold" style={{ color: kt.inkSoft }}>
            This channel didn’t return videos we can show.
          </p>
        </div>
      )}

      {!loading && videos.length > 0 && <VideoGrid videos={videos} />}

      <footer className="pb-10 pt-4 text-center text-sm font-bold" style={{ color: kt.inkSoft + "99" }}>
        Preview only — not on the kid whitelist until you tap Add.
        {channel.id ? ` · ${channel.id}` : null}
      </footer>
    </div>
  );
}

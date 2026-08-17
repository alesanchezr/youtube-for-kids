"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        const found = (data.videos as Video[] | undefined)?.find((v) => v.id === id) ?? null;
        if (!cancelled) setVideo(found);
      } catch {
        if (!cancelled) setVideo(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const embedSrc = useMemo(() => {
    if (!id) return "";
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      fs: "1",
      playsinline: "1",
      autoplay: "1",
    });
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  }, [id]);

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: kt.ink }}>
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="kt-press inline-flex items-center gap-3 rounded-full pl-4 pr-6 py-3"
          style={{
            backgroundColor: kt.sun,
            color: kt.ink,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "1.15rem",
            boxShadow: `0 5px 0 rgba(0,0,0,.35)`,
          }}
        >
          <ArrowLeft size={26} strokeWidth={3} />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-10 pb-8">
        <div className="w-full max-w-5xl">
          <div
            className="relative w-full aspect-video rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,.5)", border: `4px solid rgba(255,255,255,.08)` }}
          >
            {id ? (
              <iframe
                title={video?.title || "Video"}
                src={embedSrc}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-4 px-1">
            {video?.channel.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.channel.thumbnail}
                alt={video.channel.name}
                className="rounded-full object-cover"
                style={{ width: 56, height: 56, border: `3px solid rgba(255,255,255,.2)` }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center font-extrabold"
                style={{
                  width: 56,
                  height: 56,
                  border: `3px solid rgba(255,255,255,.2)`,
                  backgroundColor: "rgba(255,255,255,.1)",
                  color: "#FFF6E9",
                }}
              >
                {(video?.channel.name || "?").slice(0, 1)}
              </div>
            )}
            <div>
              <p
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.2rem, 3vw, 1.7rem)",
                  color: "#FFF6E9",
                  lineHeight: 1.15,
                }}
              >
                {loading ? "Loading…" : video?.title || "Video"}
              </p>
              <p className="font-bold" style={{ color: "rgba(255,246,233,.55)" }}>
                {video?.channel.name || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

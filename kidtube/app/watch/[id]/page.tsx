"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";
import { getActiveProfileId } from "@/lib/active-profile";
import { VideoRail } from "@/components/VideoRail";

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const video = useMemo(
    () => videos.find((v) => v.id === id) ?? null,
    [videos, id],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profileId = getActiveProfileId();
        if (!profileId) {
          if (!cancelled) {
            setVideos([]);
            setLoading(false);
          }
          return;
        }
        const res = await fetch(`/api/videos?profileId=${encodeURIComponent(profileId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setVideos(data.videos || []);
      } catch {
        if (!cancelled) setVideos([]);
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
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            ) : null}
          </div>

          {!loading && videos.length > 0 && (
            <VideoRail videos={videos} activeId={typeof id === "string" ? id : undefined} />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";
import { getActiveProfileId } from "@/lib/active-profile";
import { VideoRail } from "@/components/VideoRail";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          host?: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

const IDLE_MS = 3000;

function loadYouTubeApi(): Promise<NonNullable<Window["YT"]>> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [idleNonce, setIdleNonce] = useState(0);

  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const autoplayRef = useRef(false);
  autoplayRef.current = searchParams.get("autoplay") === "1";

  const bumpIdle = useCallback(() => {
    setIdleNonce((n) => n + 1);
  }, []);

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

  useEffect(() => {
    if (!id || !mountRef.current) return;

    let cancelled = false;
    setPlaying(false);
    setReady(false);
    const shouldAutoplay = autoplayRef.current;
    setChromeVisible(false);
    setIdleNonce(0);

    (async () => {
      const YT = await loadYouTubeApi();
      if (cancelled || !mountRef.current) return;

      playerRef.current?.destroy();
      playerRef.current = null;

      // YT replaces the mount node; keep a fresh child each time.
      mountRef.current.replaceChildren();
      const host = document.createElement("div");
      host.className = "absolute inset-0 w-full h-full";
      mountRef.current.appendChild(host);

      playerRef.current = new YT.Player(host, {
        videoId: id,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
          fs: 0,
          autoplay: shouldAutoplay ? 1 : 0,
          disablekb: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setReady(true);
            if (shouldAutoplay) {
              e.target.playVideo();
              setChromeVisible(false);
              if (typeof id === "string") {
                router.replace(`/watch/${id}`, { scroll: false });
              }
            }
          },
          onStateChange: (e) => {
            if (cancelled || !YT.PlayerState) return;
            const { PLAYING, BUFFERING } = YT.PlayerState;
            setPlaying(e.data === PLAYING || e.data === BUFFERING);
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [id, router]);

  useEffect(() => {
    if (!(playing && chromeVisible)) return;
    const t = setTimeout(() => setChromeVisible(false), IDLE_MS);
    return () => clearTimeout(t);
  }, [playing, chromeVisible, idleNonce]);

  function handlePlay() {
    playerRef.current?.playVideo();
    setChromeVisible(false);
    bumpIdle();
  }

  function handlePause() {
    playerRef.current?.pauseVideo();
    setChromeVisible(true);
    bumpIdle();
  }

  function onVideoTap() {
    setChromeVisible((v) => !v);
    bumpIdle();
  }

  const showRail = !loading && videos.length > 0;
  const showBack = !playing || chromeVisible;
  const controlSize = "min(28vw, 140px)";

  return (
    <div
      className="h-[100dvh] relative overflow-hidden"
      style={{ backgroundColor: "#000" }}
    >
      <div ref={mountRef} className="kt-yt-mount absolute inset-0 w-full h-full" />

      {playing ? (
        <>
          <button
            type="button"
            onClick={onVideoTap}
            aria-label={chromeVisible ? "Hide recommendations" : "Show recommendations"}
            className="absolute inset-0 z-10"
            style={{ background: "transparent", cursor: "pointer" }}
          />
          <div
            className={`kt-chrome absolute inset-0 z-20 flex items-center justify-center pointer-events-none${
              chromeVisible ? "" : " kt-chrome-hidden"
            }`}
          >
            <button
              type="button"
              onClick={handlePause}
              aria-label="Pause video"
              className="kt-press pointer-events-auto flex items-center justify-center rounded-full"
              style={{
                width: controlSize,
                height: controlSize,
                backgroundColor: kt.sun,
                color: kt.ink,
                boxShadow: "0 10px 0 rgba(0,0,0,.35)",
              }}
            >
              <Pause size={64} strokeWidth={2.5} fill="currentColor" />
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={handlePlay}
          disabled={!ready}
          aria-label="Play video"
          className="kt-press absolute inset-0 z-10 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,.35)",
            cursor: ready ? "pointer" : "wait",
          }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: controlSize,
              height: controlSize,
              backgroundColor: kt.sun,
              color: kt.ink,
              boxShadow: "0 10px 0 rgba(0,0,0,.35)",
              opacity: ready ? 1 : 0.6,
            }}
          >
            <Play
              size={64}
              strokeWidth={2.5}
              fill="currentColor"
              style={{ marginLeft: 6 }}
            />
          </span>
        </button>
      )}

      <Link
        href="/"
        className={`kt-press kt-chrome absolute top-4 left-4 z-30 inline-flex items-center gap-3 rounded-full pl-4 pr-6 py-3${
          showBack ? "" : " kt-chrome-hidden kt-chrome-back-hidden"
        }`}
        style={{
          backgroundColor: kt.sun,
          color: kt.ink,
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "1.15rem",
          boxShadow: `0 5px 0 rgba(0,0,0,.35)`,
        }}
        onPointerDown={bumpIdle}
      >
        <ArrowLeft size={26} strokeWidth={3} />
        Back
      </Link>

      {showRail && (
        <div
          className={`kt-chrome absolute bottom-0 left-0 right-0 z-30 px-3 sm:px-4 pb-4 pt-3${
            chromeVisible ? "" : " kt-chrome-hidden kt-chrome-rail-hidden"
          }`}
          style={{
            background:
              "linear-gradient(to top, rgba(38,65,60,.92) 55%, rgba(38,65,60,0))",
          }}
        >
          <VideoRail
            videos={videos}
            activeId={typeof id === "string" ? id : undefined}
            onInteract={bumpIdle}
            watchHref={(v) => `/watch/${v.id}?autoplay=1`}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/lib/types";

type Props = {
  videos: Video[];
  activeId?: string;
  watchHref?: (video: Video) => string;
  onInteract?: () => void;
  /** When false, skip centering the active card (avoids shifting a hidden rail). */
  centerActive?: boolean;
};

export function VideoRail({
  videos,
  activeId,
  watchHref,
  onInteract,
  centerActive = true,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!centerActive) return;
    const scroller = scrollerRef.current;
    const active = activeRef.current;
    if (!scroller || !active) return;

    // Scroll only inside the rail — never scrollIntoView (that shifts the watch page).
    const left = active.offsetLeft - (scroller.clientWidth - active.clientWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeId, videos, centerActive]);

  if (videos.length === 0) return null;

  return (
    <div
      ref={scrollerRef}
      className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory kt-hide-scrollbar"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      onScroll={onInteract}
      onPointerDown={onInteract}
      onTouchStart={onInteract}
    >
      {videos.map((v) => {
        const active = v.id === activeId;
        return (
          <VideoCard
            key={v.id}
            video={v}
            href={watchHref ? watchHref(v) : `/watch/${v.id}`}
            compact
            active={active}
            cardRef={active ? activeRef : undefined}
            className="snap-start shrink-0 w-[220px] sm:w-[260px]"
          />
        );
      })}
    </div>
  );
}

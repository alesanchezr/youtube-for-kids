"use client";

import { useEffect, useRef } from "react";
import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/lib/types";

type Props = {
  videos: Video[];
  activeId?: string;
  watchHref?: (video: Video) => string;
  onInteract?: () => void;
};

export function VideoRail({ videos, activeId, watchHref, onInteract }: Props) {
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId, videos]);

  if (videos.length === 0) return null;

  return (
    <div
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

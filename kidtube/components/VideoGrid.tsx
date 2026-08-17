"use client";

import { VideoCard } from "@/components/VideoCard";
import type { Video } from "@/lib/types";

type Props = {
  videos: Video[];
  /** Optional href builder (e.g. preview context). */
  watchHref?: (video: Video) => string;
};

export function VideoGrid({ videos, watchHref }: Props) {
  return (
    <main className="px-5 sm:px-8 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1400px] mx-auto">
      {videos.map((v, i) => (
        <VideoCard
          key={v.id}
          video={v}
          href={watchHref ? watchHref(v) : `/watch/${v.id}`}
          style={{
            animation: `kt-pop-in .5s cubic-bezier(.34,1.56,.64,1) both`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </main>
  );
}

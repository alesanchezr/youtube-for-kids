"use client";

import Link from "next/link";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";

type Props = {
  videos: Video[];
  /** Optional query string appended to watch links (e.g. preview context). */
  watchHref?: (video: Video) => string;
};

export function VideoGrid({ videos, watchHref }: Props) {
  return (
    <main className="px-5 sm:px-8 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1400px] mx-auto">
      {videos.map((v, i) => (
        <Link
          key={v.id}
          href={watchHref ? watchHref(v) : `/watch/${v.id}`}
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
              <img
                src={v.thumb}
                alt={v.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
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
                referrerPolicy="no-referrer"
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
  );
}

"use client";

import type { CSSProperties, Ref } from "react";
import Link from "next/link";
import { kt } from "@/lib/kidtube";
import type { Video } from "@/lib/types";

type Props = {
  video: Video;
  href: string;
  /** Extra class names on the link (e.g. shrink-0 for rails). */
  className?: string;
  style?: CSSProperties;
  compact?: boolean;
  active?: boolean;
  cardRef?: Ref<HTMLAnchorElement>;
};

export function VideoCard({ video, href, className = "", style, compact, active, cardRef }: Props) {
  const avatarSize = compact ? 36 : 44;
  const playSize = compact ? 34 : 40;

  return (
    <Link
      ref={cardRef}
      href={href}
      className={`kt-card block text-left rounded-3xl overflow-hidden ${className}`}
      style={{
        backgroundColor: "white",
        boxShadow: active ? `0 0 0 3px ${kt.sun}, 0 6px 0 ${kt.ink}14` : `0 6px 0 ${kt.ink}14`,
        border: active ? `3px solid ${kt.sun}` : `3px solid ${kt.ink}12`,
        ...style,
      }}
    >
      <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: kt.creamDeep }}>
        {video.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumb}
            alt={video.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div
          className="absolute bottom-2 right-2 flex items-center justify-center rounded-full"
          style={{
            width: playSize,
            height: playSize,
            backgroundColor: active ? kt.sun : kt.coral,
            boxShadow: "0 2px 6px rgba(0,0,0,.25)",
          }}
        >
          <svg width={compact ? 14 : 16} height={compact ? 14 : 16} viewBox="0 0 24 24" fill={active ? kt.ink : "white"}>
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </div>
      </div>
      <div className={`flex items-center gap-3 ${compact ? "p-3" : "p-4"}`}>
        {video.channel.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.channel.thumbnail}
            alt={video.channel.name}
            className="rounded-full shrink-0 object-cover"
            style={{ width: avatarSize, height: avatarSize, border: `3px solid ${kt.tealSoft}` }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="rounded-full shrink-0 flex items-center justify-center font-extrabold"
            style={{
              width: avatarSize,
              height: avatarSize,
              border: `3px solid ${kt.tealSoft}`,
              backgroundColor: kt.tealSoft,
              color: kt.teal,
            }}
          >
            {video.channel.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p
            className="truncate"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: compact ? "0.95rem" : "1.05rem",
              color: kt.ink,
            }}
          >
            {video.title}
          </p>
          <p className={`font-bold truncate ${compact ? "text-xs" : "text-sm"}`} style={{ color: kt.inkSoft }}>
            {video.channel.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

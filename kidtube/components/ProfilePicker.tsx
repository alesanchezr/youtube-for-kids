"use client";

import { kt } from "@/lib/kidtube";
import { Wordmark } from "@/components/Wordmark";

export type ProfileSummary = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  profiles: ProfileSummary[];
  onSelect: (profileId: string) => void;
  title?: string;
  subtitle?: string;
};

export function ProfilePicker({
  profiles,
  onSelect,
  title = "Who’s watching?",
  subtitle = "Pick a profile — we’ll remember on this device",
}: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
      <Wordmark size={28} />
      <h1
        className="mt-8 text-center"
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
          color: kt.ink,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      <p className="mt-2 text-center font-bold" style={{ color: kt.inkSoft }}>
        {subtitle}
      </p>

      {profiles.length === 0 ? (
        <p className="mt-10 text-center font-semibold max-w-sm" style={{ color: kt.inkSoft }}>
          No profiles yet. A grown-up can create kids from Manage channels.
        </p>
      ) : (
        <div className="mt-10 flex flex-wrap justify-center gap-5 max-w-2xl">
          {profiles.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className="kt-press flex flex-col items-center gap-3 rounded-3xl p-5 w-[140px]"
              style={{
                backgroundColor: "white",
                border: `3px solid ${kt.ink}12`,
                boxShadow: `0 6px 0 ${kt.ink}10`,
                animation: "kt-pop-in .4s ease both",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full font-extrabold text-2xl text-white"
                style={{
                  width: 72,
                  height: 72,
                  backgroundColor: p.color,
                  boxShadow: `0 4px 0 ${kt.ink}22`,
                  fontFamily: "'Baloo 2', sans-serif",
                }}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <span
                className="font-extrabold text-center truncate w-full"
                style={{ color: kt.ink, fontFamily: "'Baloo 2', sans-serif", fontSize: "1.1rem" }}
              >
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

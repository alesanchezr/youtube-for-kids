import { useState } from "react";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { KidTubeShell, kt, videos } from "./_shared/kidtube";

export default function Player() {
  const video = videos[3]; // "Blast Off to the Moon"
  const [playing, setPlaying] = useState(false);

  return (
    <KidTubeShell>
      <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: kt.ink }}>
        {/* Top bar: back only */}
        <div className="p-4 sm:p-6">
          <button
            className="kt-press flex items-center gap-3 rounded-full pl-4 pr-6 py-3"
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
          </button>
        </div>

        {/* Player surface */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-10 pb-8">
          <div className="w-full max-w-5xl">
            <div
              className="relative w-full aspect-video rounded-3xl overflow-hidden"
              style={{
                boxShadow: "0 24px 60px rgba(0,0,0,.5)",
                border: `4px solid rgba(255,255,255,.08)`,
              }}
            >
              <img src={video.thumb} alt={video.title} className="w-full h-full object-cover" />
              {!playing && <div className="absolute inset-0" style={{ backgroundColor: "rgba(20,35,32,.35)" }} />}
              {/* Big play button */}
              <button
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => setPlaying(!playing)}
                className="kt-press absolute inset-0 m-auto flex items-center justify-center rounded-full"
                style={{
                  width: 110,
                  height: 110,
                  backgroundColor: kt.coral,
                  boxShadow: "0 10px 30px rgba(0,0,0,.45)",
                  opacity: playing ? 0 : 1,
                  transition: "opacity .25s ease, transform .15s cubic-bezier(.34,1.56,.64,1)",
                  animation: playing ? undefined : "kt-float 2.6s ease-in-out infinite",
                }}
              >
                {playing ? (
                  <Pause size={48} color="white" fill="white" />
                ) : (
                  <Play size={48} color="white" fill="white" style={{ marginLeft: 6 }} />
                )}
              </button>
              {/* Simple progress bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="h-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,.25)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: playing ? "34%" : "0%", backgroundColor: kt.coral, transition: "width 1.2s ease" }}
                  />
                </div>
              </div>
            </div>

            {/* Title strip — the only text on screen */}
            <div className="mt-6 flex items-center gap-4 px-1">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                className="rounded-full"
                style={{ width: 56, height: 56, border: `3px solid rgba(255,255,255,.2)` }}
              />
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
                  {video.title}
                </p>
                <p className="font-bold" style={{ color: "rgba(255,246,233,.55)" }}>
                  {video.channel.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KidTubeShell>
  );
}

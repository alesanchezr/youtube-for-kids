import { ReactNode } from "react";

// KidTube design system — "Sunny Lagoon" palette
export const kt = {
  cream: "#FFF6E9", // warm paper background
  creamDeep: "#FFEBD0",
  teal: "#0E7A6E", // brand deep teal
  tealSoft: "#E0F2EE",
  coral: "#FF6B57", // playful accent
  coralSoft: "#FFE3DD",
  sun: "#FFC24B",
  ink: "#26413C", // deep green-ink text
  inkSoft: "#5E7B74",
};

export function KidTubeShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] w-full"
      style={{
        backgroundColor: kt.cream,
        color: kt.ink,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes kt-pop-in {
          0% { opacity: 0; transform: translateY(16px) scale(.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes kt-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .kt-card { transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease; }
        .kt-card:hover { transform: translateY(-4px) scale(1.02); }
        .kt-card:active { transform: scale(.97); }
        .kt-press { transition: transform .15s cubic-bezier(.34,1.56,.64,1); }
        .kt-press:hover { transform: scale(1.05); }
        .kt-press:active { transform: scale(.93); }
      `}</style>
      {children}
    </div>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          backgroundColor: kt.coral,
          boxShadow: `0 4px 0 ${kt.ink}22`,
          transform: "rotate(-4deg)",
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="white">
          <path d="M8 5.5v13l11-6.5z" rx="2" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: size,
          color: kt.teal,
          letterSpacing: "-0.02em",
        }}
      >
        Kid<span style={{ color: kt.coral }}>Tube</span>
      </span>
    </div>
  );
}

export type Channel = { id: string; name: string; avatar: string };

export const channels: Channel[] = [
  { id: "c1", name: "Tiny Lab Science", avatar: "/__mockup/images/avatar-science.jpg" },
  { id: "c2", name: "Owl & Ember Storytime", avatar: "/__mockup/images/avatar-story.jpg" },
  { id: "c3", name: "Wildwood Friends", avatar: "/__mockup/images/avatar-animals.jpg" },
  { id: "c4", name: "Rocket Ranger Club", avatar: "/__mockup/images/avatar-space.jpg" },
];

export type Video = { id: string; title: string; thumb: string; channel: Channel };

export const videos: Video[] = [
  { id: "v1", title: "Make a Fizzy Volcano at Home!", thumb: "/__mockup/images/thumb-volcano.jpg", channel: channels[0] },
  { id: "v2", title: "Baby Otters Hold Hands While They Sleep", thumb: "/__mockup/images/thumb-otters.jpg", channel: channels[2] },
  { id: "v3", title: "The Dragon Who Lived in a Book", thumb: "/__mockup/images/thumb-storybook.jpg", channel: channels[1] },
  { id: "v4", title: "3… 2… 1… Blast Off to the Moon!", thumb: "/__mockup/images/thumb-rocket.jpg", channel: channels[3] },
  { id: "v5", title: "Dinosaur Picnic Party", thumb: "/__mockup/images/thumb-dinos.jpg", channel: channels[2] },
  { id: "v6", title: "Counting to Ten with Ladybugs", thumb: "/__mockup/images/thumb-ladybugs.jpg", channel: channels[0] },
  { id: "v7", title: "Ollie the Octopus Paints a Rainbow", thumb: "/__mockup/images/thumb-octopus.jpg", channel: channels[1] },
  { id: "v8", title: "Let's Bake Giant Cookies Together", thumb: "/__mockup/images/thumb-baking.jpg", channel: channels[2] },
];

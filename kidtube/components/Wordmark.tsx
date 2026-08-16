import { kt } from "@/lib/kidtube";

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
          <path d="M8 5.5v13l11-6.5z" />
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

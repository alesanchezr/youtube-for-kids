import { useState } from "react";
import { ArrowLeft, Search, Plus, Trash2, Check, Clock, ShieldCheck, Delete } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KidTubeShell, Wordmark, kt, channels as approvedSeed } from "./_shared/kidtube";

const searchResults = [
  { id: "s1", name: "Cosmic Kids Yoga", subs: "1.2M subscribers", avatar: "/__mockup/images/avatar-space.jpg" },
  { id: "s2", name: "Story Pirates", subs: "480K subscribers", avatar: "/__mockup/images/avatar-story.jpg" },
  { id: "s3", name: "Nat Geo Little Explorers", subs: "2.1M subscribers", avatar: "/__mockup/images/avatar-animals.jpg" },
];

export default function Manage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [approved, setApproved] = useState(approvedSeed);
  const [added, setAdded] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  const press = (d: string) => {
    if (d === "back") {
      setPin(pin.slice(0, -1));
      return;
    }
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => setUnlocked(true), 250);
  };

  const change = (fn: () => void) => {
    fn();
    setShowBanner(true);
  };

  if (!unlocked) {
    return (
      <KidTubeShell>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
          <Wordmark size={22} />
          <div
            className="mt-8 w-full max-w-sm rounded-3xl p-8 text-center"
            style={{ backgroundColor: "white", boxShadow: `0 8px 0 ${kt.ink}12`, border: `3px solid ${kt.ink}10` }}
          >
            <div
              className="mx-auto flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, backgroundColor: kt.tealSoft }}
            >
              <ShieldCheck size={28} color={kt.teal} />
            </div>
            <h1 className="mt-4" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: kt.ink }}>
              Grown-ups only
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: kt.inkSoft }}>
              Enter your PIN to manage channels
            </p>
            {/* PIN dots */}
            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: i < pin.length ? kt.teal : kt.tealSoft,
                    transform: i < pin.length ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            {/* Keypad */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
                k === "" ? (
                  <div key={i} />
                ) : (
                  <button
                    key={i}
                    onClick={() => press(k)}
                    className="kt-press rounded-2xl py-3.5 flex items-center justify-center"
                    style={{
                      backgroundColor: kt.cream,
                      border: `2px solid ${kt.ink}12`,
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: kt.ink,
                    }}
                  >
                    {k === "back" ? <Delete size={20} color={kt.inkSoft} /> : k}
                  </button>
                )
              )}
            </div>
          </div>
          <p className="mt-6 text-xs font-semibold" style={{ color: kt.inkSoft + "AA" }}>
            The PIN is checked securely on the server, never stored on this device.
          </p>
        </div>
      </KidTubeShell>
    );
  }

  return (
    <KidTubeShell>
      <header
        className="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center gap-4"
        style={{ backgroundColor: kt.cream + "F2", backdropFilter: "blur(8px)", borderBottom: `2px dashed ${kt.teal}22` }}
      >
        <button
          className="kt-press flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, backgroundColor: "white", border: `2px solid ${kt.ink}14` }}
          aria-label="Back to videos"
        >
          <ArrowLeft size={20} color={kt.ink} strokeWidth={2.5} />
        </button>
        <div>
          <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: kt.ink, lineHeight: 1.1 }}>
            Manage channels
          </h1>
          <p className="text-xs font-bold" style={{ color: kt.inkSoft }}>
            Only channels on this list can appear in the app
          </p>
        </div>
      </header>

      {showBanner && (
        <div className="px-5 sm:px-8 pt-4 max-w-3xl mx-auto w-full" style={{ animation: "kt-pop-in .4s ease both" }}>
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ backgroundColor: kt.tealSoft, border: `2px solid ${kt.teal}33` }}
          >
            <Clock size={18} color={kt.teal} />
            <p className="text-sm font-bold" style={{ color: kt.teal }}>
              Updating… changes appear in the kid view in about 2 minutes.
            </p>
          </div>
        </div>
      )}

      <main className="px-5 sm:px-8 py-6 max-w-3xl mx-auto w-full space-y-8 pb-16">
        {/* Search & add */}
        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
            Find a channel to add
          </h2>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" color={kt.inkSoft} />
            <Input
              defaultValue="kids yoga"
              className="pl-11 h-12 rounded-2xl bg-white text-base font-semibold"
              style={{ border: `2px solid ${kt.ink}14`, color: kt.ink }}
              placeholder="Search YouTube channels"
            />
          </div>
          <div className="mt-3 space-y-2">
            {searchResults.map((r, i) => {
              const isAdded = added.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-3.5"
                  style={{ border: `2px solid ${kt.ink}10`, animation: `kt-pop-in .4s ease both`, animationDelay: `${i * 70}ms` }}
                >
                  <img src={r.avatar} alt={r.name} className="rounded-full" style={{ width: 48, height: 48 }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold truncate" style={{ color: kt.ink }}>{r.name}</p>
                    <p className="text-xs font-semibold" style={{ color: kt.inkSoft }}>{r.subs}</p>
                  </div>
                  <button
                    onClick={() => !isAdded && change(() => setAdded([...added, r.id]))}
                    className="kt-press flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold shrink-0"
                    style={{
                      backgroundColor: isAdded ? kt.tealSoft : kt.teal,
                      color: isAdded ? kt.teal : "white",
                    }}
                  >
                    {isAdded ? <Check size={16} /> : <Plus size={16} />}
                    {isAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Approved list */}
        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
            Approved channels · {approved.length}
          </h2>
          <div className="space-y-2">
            {approved.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-2xl bg-white p-3.5"
                style={{ border: `2px solid ${kt.ink}10` }}
              >
                <img src={c.avatar} alt={c.name} className="rounded-full" style={{ width: 48, height: 48, border: `3px solid ${kt.tealSoft}` }} />
                <p className="font-extrabold flex-1 truncate" style={{ color: kt.ink }}>{c.name}</p>
                <button
                  aria-label={`Remove ${c.name}`}
                  onClick={() => change(() => setApproved(approved.filter((a) => a.id !== c.id)))}
                  className="kt-press flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, backgroundColor: kt.coralSoft, color: kt.coral }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {approved.length === 0 && (
              <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: kt.creamDeep }}>
                <p className="font-extrabold" style={{ color: kt.ink }}>No channels yet</p>
                <p className="text-sm font-semibold mt-1" style={{ color: kt.inkSoft }}>
                  Search above to add the first one — the kid view stays empty until you do.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </KidTubeShell>
  );
}

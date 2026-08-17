"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Plus, Trash2, Check, Clock, ShieldCheck, Delete } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Channel } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";

type SearchResult = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
};

const PIN_SESSION_KEY = "kidtube_admin_pin";

export default function Manage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [sessionPin, setSessionPin] = useState("");
  const [approved, setApproved] = useState<Channel[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("Updating… changes appear in the kid view in about 2 minutes.");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_SESSION_KEY);
    if (!saved) return;
    void (async () => {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: saved }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionPin(saved);
        setUnlocked(true);
        setApproved(data.channels || []);
      } else {
        sessionStorage.removeItem(PIN_SESSION_KEY);
      }
    })();
  }, []);

  const unlockWithPin = async (nextPin: string) => {
    setPinBusy(true);
    setPinError(null);
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: nextPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error || "Incorrect PIN");
        setPin("");
        return;
      }
      sessionStorage.setItem(PIN_SESSION_KEY, nextPin);
      setSessionPin(nextPin);
      setUnlocked(true);
      setApproved(data.channels || []);
    } catch {
      setPinError("Could not reach the server.");
      setPin("");
    } finally {
      setPinBusy(false);
    }
  };

  const press = (d: string) => {
    if (pinBusy) return;
    if (d === "back") {
      setPin((p) => p.slice(0, -1));
      setPinError(null);
      return;
    }
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setPinError(null);
    if (next.length === 4) {
      void unlockWithPin(next);
    }
  };

  const runSearch = useCallback(async () => {
    if (!sessionPin || query.trim().length < 2) return;
    setSearching(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/search-channel?q=${encodeURIComponent(query.trim())}&pin=${encodeURIComponent(sessionPin)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.results || []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query, sessionPin]);

  const add = async (r: SearchResult) => {
    setActionError(null);
    try {
      const res = await fetch("/api/add-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: sessionPin,
          id: r.id,
          name: r.name,
          thumbnail: r.thumbnail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setApproved(data.channels || []);
      setAddedIds((ids) => [...ids, r.id]);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add channel");
    }
  };

  const remove = async (c: Channel) => {
    setActionError(null);
    try {
      const res = await fetch("/api/remove-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: sessionPin, id: c.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");
      setApproved(data.channels || []);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to remove channel");
    }
  };

  if (!unlocked) {
    return (
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
          <div className="mt-6 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: i < Math.min(pin.length, 4) ? kt.teal : kt.tealSoft,
                  transform: i < Math.min(pin.length, 4) ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
          {pinError && (
            <p className="mt-3 text-sm font-bold" style={{ color: kt.coral }}>
              {pinError}
            </p>
          )}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
              k === "" ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  disabled={pinBusy}
                  onClick={() => press(k)}
                  className="kt-press rounded-2xl py-3.5 flex items-center justify-center"
                  style={{
                    backgroundColor: kt.cream,
                    border: `2px solid ${kt.ink}12`,
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: kt.ink,
                    opacity: pinBusy ? 0.6 : 1,
                  }}
                >
                  {k === "back" ? <Delete size={20} color={kt.inkSoft} /> : k}
                </button>
              ),
            )}
          </div>
        </div>
        <p className="mt-6 text-xs font-semibold" style={{ color: kt.inkSoft + "AA" }}>
          The PIN is checked securely on the server, never stored on this device beyond this session.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header
        className="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center gap-4"
        style={{ backgroundColor: kt.cream + "F2", backdropFilter: "blur(8px)", borderBottom: `2px dashed ${kt.teal}22` }}
      >
        <Link
          href="/"
          className="kt-press flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, backgroundColor: "white", border: `2px solid ${kt.ink}14` }}
          aria-label="Back to videos"
        >
          <ArrowLeft size={20} color={kt.ink} strokeWidth={2.5} />
        </Link>
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
              {bannerText}
            </p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="px-5 sm:px-8 pt-4 max-w-3xl mx-auto w-full">
          <div
            className="rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ backgroundColor: kt.coralSoft, color: kt.coral, border: `2px solid ${kt.coral}33` }}
          >
            {actionError}
          </div>
        </div>
      )}

      <main className="px-5 sm:px-8 py-6 max-w-3xl mx-auto w-full space-y-8 pb-16">
        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
            Find a channel to add
          </h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch();
            }}
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" color={kt.inkSoft} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-white text-base font-semibold outline-none focus:ring-2"
                style={{ border: `2px solid ${kt.ink}14`, color: kt.ink }}
                placeholder="Search YouTube channels"
              />
            </div>
            <button
              type="submit"
              disabled={searching || query.trim().length < 2}
              className="kt-press rounded-2xl px-5 font-extrabold text-white shrink-0"
              style={{ backgroundColor: kt.teal, opacity: searching || query.trim().length < 2 ? 0.6 : 1 }}
            >
              {searching ? "…" : "Search"}
            </button>
          </form>
          <div className="mt-3 space-y-2">
            {results.map((r, i) => {
              const already = approved.some((c) => c.id === r.id) || addedIds.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-3.5"
                  style={{ border: `2px solid ${kt.ink}10`, animation: `kt-pop-in .4s ease both`, animationDelay: `${i * 70}ms` }}
                >
                  {r.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnail} alt={r.name} className="rounded-full object-cover" style={{ width: 48, height: 48 }} />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center font-extrabold"
                      style={{ width: 48, height: 48, backgroundColor: kt.tealSoft, color: kt.teal }}
                    >
                      {r.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold truncate" style={{ color: kt.ink }}>
                      {r.name}
                    </p>
                    <p className="text-xs font-semibold truncate" style={{ color: kt.inkSoft }}>
                      {r.description || r.id}
                    </p>
                  </div>
                  <button
                    onClick={() => !already && void add(r)}
                    disabled={already}
                    className="kt-press flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold shrink-0"
                    style={{
                      backgroundColor: already ? kt.tealSoft : kt.teal,
                      color: already ? kt.teal : "white",
                    }}
                  >
                    {already ? <Check size={16} /> : <Plus size={16} />}
                    {already ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

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
                {c.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumbnail}
                    alt={c.name}
                    className="rounded-full object-cover"
                    style={{ width: 48, height: 48, border: `3px solid ${kt.tealSoft}` }}
                  />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center font-extrabold"
                    style={{
                      width: 48,
                      height: 48,
                      border: `3px solid ${kt.tealSoft}`,
                      backgroundColor: kt.tealSoft,
                      color: kt.teal,
                    }}
                  >
                    {c.name.slice(0, 1)}
                  </div>
                )}
                <p className="font-extrabold flex-1 truncate" style={{ color: kt.ink }}>
                  {c.name}
                </p>
                <button
                  aria-label={`Remove ${c.name}`}
                  onClick={() => void remove(c)}
                  className="kt-press flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, backgroundColor: kt.coralSoft, color: kt.coral }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {approved.length === 0 && (
              <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: kt.creamDeep }}>
                <p className="font-extrabold" style={{ color: kt.ink }}>
                  No channels yet
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: kt.inkSoft }}>
                  Search above to add the first one — the kid view stays empty until you do.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

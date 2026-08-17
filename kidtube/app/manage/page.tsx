"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Clock, ShieldCheck, Delete } from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Profile } from "@/lib/types";
import { PROFILE_COLORS } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";
import { setActiveProfileId } from "@/lib/active-profile";

const PIN_SESSION_KEY = "kidtube_admin_pin";

export default function Manage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [sessionPin, setSessionPin] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("Updating… changes appear in the kid view in about 2 minutes.");
  const [actionError, setActionError] = useState<string | null>(null);
  const [addingKid, setAddingKid] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

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
        setProfiles(data.profiles || []);
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
      setProfiles(data.profiles || []);
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

  const createProfile = async () => {
    const name = newProfileName.trim();
    if (!name) return;
    setActionError(null);
    try {
      const res = await fetch("/api/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: sessionPin,
          name,
          color: PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add profile");
      const next: Profile[] = data.profiles || [];
      const created = next.find((p) => p.name === name) || next[next.length - 1];
      setProfiles(next);
      if (created?.id) {
        setActiveProfileId(created.id);
        router.push(`/manage/${encodeURIComponent(created.id)}`);
        return;
      }
      setNewProfileName("");
      setAddingKid(false);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add profile");
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
            Enter your PIN to manage kids & channels
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
        <div className="min-w-0 flex-1">
          <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: kt.ink, lineHeight: 1.1 }}>
            Manage kids
          </h1>
          <p className="text-xs font-bold" style={{ color: kt.inkSoft }}>
            Tap a kid to manage their channels
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black tracking-wide"
          style={{
            backgroundColor: kt.tealSoft,
            color: kt.teal,
            border: `2px solid ${kt.teal}33`,
            fontFamily: "'Baloo 2', sans-serif",
          }}
          title="Increases with each git commit / deploy"
        >
          {`v${process.env.NEXT_PUBLIC_APP_VERSION || "0"}`}
        </span>
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
            Kids
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profiles.map((p) => (
              <Link
                key={p.id}
                href={`/manage/${encodeURIComponent(p.id)}`}
                className="kt-press flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 font-extrabold text-sm"
                style={{
                  backgroundColor: "white",
                  color: kt.ink,
                  border: `2px solid ${kt.ink}14`,
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: p.color,
                    fontFamily: "'Baloo 2', sans-serif",
                  }}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                {p.name}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setAddingKid(true);
                setNewProfileName("");
              }}
              className="kt-press flex items-center justify-center rounded-full font-extrabold"
              style={{
                width: 39,
                height: 39,
                backgroundColor: "white",
                color: kt.teal,
                border: `2px dashed ${kt.teal}66`,
              }}
              aria-label="Add another kid"
            >
              <Plus size={18} strokeWidth={2.75} />
            </button>
          </div>

          {addingKid && (
            <form
              className="flex gap-2 mb-2"
              onSubmit={(e) => {
                e.preventDefault();
                void createProfile();
              }}
            >
              <input
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="flex-1 h-11 rounded-2xl bg-white px-4 text-sm font-semibold outline-none"
                style={{ border: `2px solid ${kt.ink}14`, color: kt.ink }}
                placeholder="Kid’s name"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newProfileName.trim()}
                className="kt-press rounded-2xl px-4 font-extrabold text-white shrink-0"
                style={{ backgroundColor: kt.teal, opacity: newProfileName.trim() ? 1 : 0.5 }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingKid(false);
                  setNewProfileName("");
                }}
                className="kt-press rounded-2xl px-4 font-extrabold shrink-0"
                style={{ backgroundColor: kt.cream, color: kt.ink, border: `2px solid ${kt.ink}14` }}
              >
                Cancel
              </button>
            </form>
          )}

          {profiles.length === 0 && !addingKid && (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: kt.creamDeep }}>
              <p className="font-extrabold" style={{ color: kt.ink }}>
                No kids yet
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: kt.inkSoft }}>
                Tap + to add the first profile.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

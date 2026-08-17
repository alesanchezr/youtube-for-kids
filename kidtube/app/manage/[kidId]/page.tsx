"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Check,
  Clock,
  Eye,
  Pencil,
} from "lucide-react";
import { kt } from "@/lib/kidtube";
import type { Channel, Profile } from "@/lib/types";
import { clearActiveProfileId, getActiveProfileId } from "@/lib/active-profile";

type SearchResult = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
};

const PIN_SESSION_KEY = "kidtube_admin_pin";

export default function ManageKidPage() {
  const { kidId: rawKidId } = useParams<{ kidId: string }>();
  const kidId = decodeURIComponent(rawKidId || "");
  const router = useRouter();

  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState(
    "Updating… changes appear in the kid view in about 2 minutes.",
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const profile = profiles.find((p) => p.id === kidId) || null;
  const approved: Channel[] = profile?.channels || [];
  const canRemove = profiles.length > 1;

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_SESSION_KEY);
    if (!saved) {
      router.replace("/manage");
      return;
    }
    void (async () => {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: saved }),
      });
      const data = await res.json();
      if (!res.ok) {
        sessionStorage.removeItem(PIN_SESSION_KEY);
        router.replace("/manage");
        return;
      }
      setSessionPin(saved);
      setProfiles(data.profiles || []);
      setLoading(false);
    })();
  }, [router]);

  const runSearch = useCallback(async () => {
    if (!sessionPin || query.trim().length < 2) return;
    setSearching(true);
    setActionError(null);
    try {
      const res = await fetch(
        `/api/search-channel?q=${encodeURIComponent(query.trim())}&pin=${encodeURIComponent(sessionPin)}`,
      );
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
    if (!sessionPin || !kidId) return;
    setActionError(null);
    try {
      const res = await fetch("/api/add-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: sessionPin,
          profileId: kidId,
          id: r.id,
          name: r.name,
          thumbnail: r.thumbnail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setProfiles(data.profiles || []);
      setAddedIds((ids) => [...ids, r.id]);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add channel");
    }
  };

  const removeChannel = async (c: Channel) => {
    if (!sessionPin || !kidId) return;
    setActionError(null);
    try {
      const res = await fetch("/api/remove-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: sessionPin, profileId: kidId, id: c.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");
      setProfiles(data.profiles || []);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to remove channel");
    }
  };

  const saveRename = async () => {
    if (!sessionPin || !kidId || !renameValue.trim()) {
      setRenaming(false);
      return;
    }
    setActionError(null);
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: sessionPin,
          id: kidId,
          name: renameValue.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rename");
      setProfiles(data.profiles || []);
      setRenaming(false);
      setBannerText(data.message || bannerText);
      setShowBanner(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to rename profile");
    }
  };

  const confirmRemove = async () => {
    if (!sessionPin || !kidId || !canRemove) return;
    setRemoving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/remove-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: sessionPin, id: kidId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove profile");
      if (getActiveProfileId() === kidId) {
        clearActiveProfileId();
      }
      router.replace("/manage");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to remove profile");
      setRemoveOpen(false);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div
          className="rounded-full animate-pulse"
          style={{ width: 48, height: 48, backgroundColor: kt.tealSoft }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gap-4">
        <p className="font-extrabold text-lg" style={{ color: kt.ink }}>
          Kid not found
        </p>
        <Link
          href="/manage"
          className="kt-press rounded-full px-5 py-2.5 font-extrabold text-white"
          style={{ backgroundColor: kt.teal }}
        >
          Back to kids
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header
        className="sticky top-0 z-20 px-5 sm:px-8 py-4 flex items-center gap-4"
        style={{
          backgroundColor: kt.cream + "F2",
          backdropFilter: "blur(8px)",
          borderBottom: `2px dashed ${kt.teal}22`,
        }}
      >
        <Link
          href="/manage"
          className="kt-press flex items-center justify-center rounded-full shrink-0"
          style={{ width: 44, height: 44, backgroundColor: "white", border: `2px solid ${kt.ink}14` }}
          aria-label="Back to kids"
        >
          <ArrowLeft size={20} color={kt.ink} strokeWidth={2.5} />
        </Link>
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <span
            className="flex items-center justify-center rounded-full text-white font-extrabold shrink-0"
            style={{
              width: 40,
              height: 40,
              backgroundColor: profile.color,
              fontFamily: "'Baloo 2', sans-serif",
            }}
          >
            {profile.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1
              className="truncate"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.35rem",
                color: kt.ink,
                lineHeight: 1.1,
              }}
            >
              {profile.name}
            </h1>
            <p className="text-xs font-bold" style={{ color: kt.inkSoft }}>
              Channels & profile
            </p>
          </div>
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
            Profile
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {renaming ? (
              <>
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="h-10 rounded-xl bg-white px-3 text-sm font-semibold outline-none"
                  style={{ border: `2px solid ${kt.ink}14`, color: kt.ink, minWidth: 160 }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => void saveRename()}
                  className="kt-press rounded-full px-3 py-2 text-sm font-extrabold text-white"
                  style={{ backgroundColor: kt.teal }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setRenaming(false)}
                  className="kt-press rounded-full px-3 py-2 text-sm font-extrabold"
                  style={{ backgroundColor: kt.cream, color: kt.ink }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRenameValue(profile.name);
                    setRenaming(true);
                  }}
                  className="kt-press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold"
                  style={{ backgroundColor: "white", border: `2px solid ${kt.ink}14`, color: kt.ink }}
                >
                  <Pencil size={14} />
                  Rename {profile.name}
                </button>
                <button
                  type="button"
                  onClick={() => setRemoveOpen(true)}
                  disabled={!canRemove}
                  className="kt-press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold"
                  style={{
                    backgroundColor: kt.coralSoft,
                    color: kt.coral,
                    opacity: canRemove ? 1 : 0.4,
                  }}
                  title={canRemove ? undefined : "You need at least one kid"}
                >
                  <Trash2 size={14} />
                  Remove kid
                </button>
              </>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
            Find a channel for {profile.name}
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
                  style={{
                    border: `2px solid ${kt.ink}10`,
                    animation: `kt-pop-in .4s ease both`,
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  {r.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.thumbnail}
                      alt={r.name}
                      className="rounded-full object-cover"
                      style={{ width: 48, height: 48 }}
                      referrerPolicy="no-referrer"
                    />
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/manage/channel/${encodeURIComponent(r.id)}?name=${encodeURIComponent(r.name)}&thumbnail=${encodeURIComponent(r.thumbnail)}&profileId=${encodeURIComponent(kidId)}`}
                      className="kt-press flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold"
                      style={{
                        backgroundColor: kt.cream,
                        color: kt.ink,
                        border: `2px solid ${kt.ink}14`,
                      }}
                    >
                      <Eye size={16} />
                      Preview
                    </Link>
                    <button
                      onClick={() => !already && void add(r)}
                      disabled={already}
                      className="kt-press flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold"
                      style={{
                        backgroundColor: already ? kt.tealSoft : kt.teal,
                        color: already ? kt.teal : "white",
                      }}
                    >
                      {already ? <Check size={16} /> : <Plus size={16} />}
                      {already ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: kt.inkSoft }}>
            {profile.name}&apos;s channels · {approved.length}
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
                    referrerPolicy="no-referrer"
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
                  onClick={() => void removeChannel(c)}
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
                  No channels yet for {profile.name}
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: kt.inkSoft }}>
                  Search above to add the first one — their kid view stays empty until you do.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {removeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(38, 65, 60, 0.45)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-kid-title"
          onClick={() => !removing && setRemoveOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6"
            style={{ border: `3px solid ${kt.ink}10`, boxShadow: `0 12px 0 ${kt.ink}14` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="remove-kid-title"
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.35rem",
                color: kt.ink,
              }}
            >
              Remove {profile.name}?
            </h2>
            <p className="mt-2 text-sm font-semibold" style={{ color: kt.inkSoft }}>
              Their channel list will be deleted. This can’t be undone from the app.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={removing}
                onClick={() => setRemoveOpen(false)}
                className="kt-press flex-1 rounded-2xl py-3 font-extrabold"
                style={{ backgroundColor: kt.cream, color: kt.ink, border: `2px solid ${kt.ink}14` }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={() => void confirmRemove()}
                className="kt-press flex-1 rounded-2xl py-3 font-extrabold text-white"
                style={{ backgroundColor: kt.coral, opacity: removing ? 0.7 : 1 }}
              >
                {removing ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

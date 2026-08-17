"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { kt } from "@/lib/kidtube";

const CHANNEL_NAME = "kidtube-sw";
const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0";

export function PwaUpdater() {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const refreshingRef = useRef(false);

  const applyUpdate = useCallback(() => {
    const waiting = waitingWorkerRef.current;
    if (!waiting) {
      window.location.reload();
      return;
    }
    waiting.postMessage({ type: "SKIP_WAITING" });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data?.type === "RELOAD" && !refreshingRef.current) {
        refreshingRef.current = true;
        window.location.reload();
      }
    };

    const onControllerChange = () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      channel.postMessage({ type: "RELOAD" });
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const trackWaiting = (worker: ServiceWorker | null) => {
      if (!worker || cancelled) return;
      waitingWorkerRef.current = worker;
      setUpdateReady(true);
    };

    const watchInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          trackWaiting(worker);
        }
      });
    };

    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdates = () => {
      void registration?.update();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdates();
    };

    void (async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");
        if (cancelled) return;

        if (registration.waiting && navigator.serviceWorker.controller) {
          trackWaiting(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          watchInstalling(registration?.installing ?? null);
        });

        window.addEventListener("focus", checkForUpdates);
        document.addEventListener("visibilitychange", onVisibilityChange);
      } catch {
        // Registration can fail on unsupported hosts; fail silently.
      }
    })();

    return () => {
      cancelled = true;
      channel.close();
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("focus", checkForUpdates);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
      style={{ animation: "kt-pop-in .4s ease both" }}
    >
      <div
        className="pointer-events-auto mx-auto max-w-lg flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg"
        style={{
          backgroundColor: kt.tealSoft,
          border: `2px solid ${kt.teal}33`,
          color: kt.teal,
        }}
        role="status"
      >
        <RefreshCw size={18} color={kt.teal} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold leading-snug"
            style={{ fontFamily: "'Baloo 2', sans-serif", color: kt.teal }}
          >
            A new version of KidTube is ready
          </p>
          <p className="text-xs font-semibold opacity-80" style={{ color: kt.inkSoft }}>
            v{VERSION}
          </p>
        </div>
        <button
          type="button"
          onClick={applyUpdate}
          className="kt-press shrink-0 rounded-xl px-4 py-2 text-sm font-extrabold text-white"
          style={{ backgroundColor: kt.teal, fontFamily: "'Baloo 2', sans-serif" }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}

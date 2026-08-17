"use client";

import { Suspense } from "react";
import ChannelPreview from "./ChannelPreviewClient";
import { kt } from "@/lib/kidtube";

export default function ChannelPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center font-bold" style={{ color: kt.inkSoft }}>
          Loading preview…
        </div>
      }
    >
      <ChannelPreview />
    </Suspense>
  );
}

import { NextResponse } from "next/server";
import { listChannels } from "@/lib/channels-store";
import { fetchAllVideos } from "@/lib/youtube";

export const runtime = "nodejs";

export async function GET() {
  try {
    const channels = listChannels();
    if (channels.length === 0) {
      return NextResponse.json(
        { videos: [], channels: [] },
        {
          headers: {
            "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
          },
        },
      );
    }

    const videos = await fetchAllVideos(channels, 60);
    return NextResponse.json(
      { videos, channels },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load videos";
    console.error("/api/videos", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

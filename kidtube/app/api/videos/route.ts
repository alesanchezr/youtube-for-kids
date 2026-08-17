import { NextResponse } from "next/server";
import { listChannelsForProfile, listProfiles } from "@/lib/channels-store";
import { fetchAllVideos } from "@/lib/youtube";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = (searchParams.get("profileId") || "").trim();

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required." }, { status: 400 });
    }

    const profile = listProfiles().find((p) => p.id === profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const channels = listChannelsForProfile(profileId);
    if (channels.length === 0) {
      return NextResponse.json(
        { videos: [], channels: [], profile: { id: profile.id, name: profile.name, color: profile.color } },
        {
          headers: {
            "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
          },
        },
      );
    }

    const videos = await fetchAllVideos(channels, 60);
    return NextResponse.json(
      {
        videos,
        channels,
        profile: { id: profile.id, name: profile.name, color: profile.color },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load videos";
    console.error("/api/videos", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import type { Channel, Video } from "./types";

const YT = "https://www.googleapis.com/youtube/v3";

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  return key;
}

/** UC… channel id → UU… uploads playlist id (no extra API call). */
export function uploadsPlaylistId(channelId: string): string {
  if (!channelId.startsWith("UC") || channelId.length < 3) {
    throw new Error(`Invalid channel id: ${channelId}`);
  }
  return `UU${channelId.slice(2)}`;
}

type PlaylistItem = {
  contentDetails?: { videoId?: string };
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
      default?: { url?: string };
    };
  };
};

export async function fetchChannelUploads(channel: Channel, maxPerChannel = 15): Promise<Video[]> {
  const playlistId = uploadsPlaylistId(channel.id);
  const url = new URL(`${YT}/playlistItems`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", String(maxPerChannel));
  url.searchParams.set("key", apiKey());

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    const body = await res.text();
    console.error("playlistItems failed", channel.id, res.status, body);
    return [];
  }

  const data = (await res.json()) as { items?: PlaylistItem[] };
  const videos: Video[] = [];

  for (const item of data.items ?? []) {
    const id = item.contentDetails?.videoId;
    const title = item.snippet?.title;
    if (!id || !title || title === "Private video" || title === "Deleted video") continue;
    const thumbs = item.snippet?.thumbnails;
    const thumb = thumbs?.high?.url || thumbs?.medium?.url || thumbs?.default?.url || "";
    videos.push({
      id,
      title,
      thumb,
      publishedAt: item.snippet?.publishedAt || "",
      channel,
    });
  }

  return videos;
}

export async function fetchAllVideos(channels: Channel[], limit = 60): Promise<Video[]> {
  const batches = await Promise.all(channels.map((c) => fetchChannelUploads(c)));
  return batches
    .flat()
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
    .slice(0, limit);
}

type SearchItem = {
  id?: { channelId?: string };
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

export type ChannelSearchResult = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
};

export async function searchChannels(query: string, maxResults = 8): Promise<ChannelSearchResult[]> {
  const url = new URL(`${YT}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "channel");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube search failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { items?: SearchItem[] };
  return (data.items ?? [])
    .map((item) => {
      const id = item.id?.channelId;
      const name = item.snippet?.title;
      if (!id || !name) return null;
      const thumbs = item.snippet?.thumbnails;
      return {
        id,
        name,
        thumbnail: thumbs?.medium?.url || thumbs?.high?.url || thumbs?.default?.url || "",
        description: item.snippet?.description || "",
      };
    })
    .filter((x): x is ChannelSearchResult => x !== null);
}

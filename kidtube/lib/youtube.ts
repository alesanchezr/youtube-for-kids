import type { Channel, Video } from "./types";

const YT = "https://www.googleapis.com/youtube/v3";
const YT_RSS = "https://www.youtube.com/feeds/videos.xml";

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not configured");
  return key;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

function tagValue(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m?.[1]?.trim() ?? "";
}

function attrValue(block: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i");
  const m = block.match(re);
  return m?.[1] ?? "";
}

/** Newest uploads via public channel Atom feed (no API key / quota). */
export async function fetchChannelUploads(channel: Channel, maxPerChannel = 15): Promise<Video[]> {
  if (!channel.id.startsWith("UC") || channel.id.length < 3) {
    throw new Error(`Invalid channel id: ${channel.id}`);
  }

  const url = `${YT_RSS}?channel_id=${encodeURIComponent(channel.id)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("channel RSS failed", channel.id, res.status, body.slice(0, 200));
    throw new Error(`YouTube channel RSS failed (${res.status}) for ${channel.id}`);
  }

  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  const videos: Video[] = [];

  for (const entry of entries) {
    if (videos.length >= maxPerChannel) break;

    const id =
      tagValue(entry, "yt:videoId") ||
      tagValue(entry, "id").replace(/^yt:video:/, "");
    const title = decodeXmlEntities(tagValue(entry, "title"));
    if (!id || !title || title === "Private video" || title === "Deleted video") continue;

    const thumb =
      attrValue(entry, "media:thumbnail", "url") ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const publishedAt = tagValue(entry, "published");

    videos.push({
      id,
      title,
      thumb,
      publishedAt,
      channel,
    });
  }

  return videos;
}

export async function fetchAllVideos(channels: Channel[], limit = 60): Promise<Video[]> {
  const batches = await Promise.all(
    channels.map(async (c) => {
      try {
        return await fetchChannelUploads(c);
      } catch (err) {
        console.error(err);
        return [];
      }
    }),
  );
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

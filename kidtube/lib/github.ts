import type { Channel, ChannelsFile } from "./types";
import { CHANNELS_REPO_PATH } from "./channels-store";

function repo(): string {
  const r = process.env.GITHUB_REPO;
  if (!r || !r.includes("/")) throw new Error("GITHUB_REPO must be owner/repo");
  return r;
}

function token(): string {
  const t = process.env.GITHUB_TOKEN;
  if (!t) throw new Error("GITHUB_TOKEN is not configured");
  return t;
}

type GhContent = {
  sha: string;
  content: string;
  encoding: string;
};

async function getChannelsFile(): Promise<{ sha: string; data: ChannelsFile }> {
  const url = `https://api.github.com/repos/${repo()}/contents/${CHANNELS_REPO_PATH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${body}`);
  }
  const file = (await res.json()) as GhContent;
  const json = Buffer.from(file.content, "base64").toString("utf8");
  return { sha: file.sha, data: JSON.parse(json) as ChannelsFile };
}

async function putChannelsFile(data: ChannelsFile, sha: string, message: string) {
  const url = `https://api.github.com/repos/${repo()}/contents/${CHANNELS_REPO_PATH}`;
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf8").toString("base64");
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ message, content, sha }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub write failed (${res.status}): ${body}`);
  }
}

export async function addChannel(channel: Channel): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  if (data.channels.some((c) => c.id === channel.id)) {
    return data;
  }
  const next: ChannelsFile = { channels: [...data.channels, channel] };
  await putChannelsFile(next, sha, `chore: add channel ${channel.name}`);
  return next;
}

export async function removeChannel(channelId: string): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  const target = data.channels.find((c) => c.id === channelId);
  const next: ChannelsFile = {
    channels: data.channels.filter((c) => c.id !== channelId),
  };
  if (next.channels.length === data.channels.length) {
    return data;
  }
  await putChannelsFile(next, sha, `chore: remove channel ${target?.name || channelId}`);
  return next;
}

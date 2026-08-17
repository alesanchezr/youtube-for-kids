import type { Channel, ChannelsFile, Profile } from "./types";
import { PROFILE_COLORS } from "./types";
import { CHANNELS_REPO_PATH, normalizeChannelsFile } from "./channels-store";

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
  return { sha: file.sha, data: normalizeChannelsFile(JSON.parse(json)) };
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

function requireProfile(data: ChannelsFile, profileId: string): Profile {
  const profile = data.profiles.find((p) => p.id === profileId);
  if (!profile) throw new Error("Profile not found.");
  return profile;
}

export async function addChannel(profileId: string, channel: Channel): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  const profile = requireProfile(data, profileId);
  if (profile.channels.some((c) => c.id === channel.id)) {
    return data;
  }
  const next: ChannelsFile = {
    profiles: data.profiles.map((p) =>
      p.id === profileId ? { ...p, channels: [...p.channels, channel] } : p,
    ),
  };
  await putChannelsFile(next, sha, `chore: add channel ${channel.name} to ${profile.name}`);
  return next;
}

export async function removeChannel(profileId: string, channelId: string): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  const profile = requireProfile(data, profileId);
  const target = profile.channels.find((c) => c.id === channelId);
  if (!target) return data;
  const next: ChannelsFile = {
    profiles: data.profiles.map((p) =>
      p.id === profileId
        ? { ...p, channels: p.channels.filter((c) => c.id !== channelId) }
        : p,
    ),
  };
  await putChannelsFile(next, sha, `chore: remove channel ${target.name} from ${profile.name}`);
  return next;
}

export async function addProfile(name: string, color?: string): Promise<ChannelsFile> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Profile name is required.");
  const { sha, data } = await getChannelsFile();
  const id = `profile-${Date.now().toString(36)}`;
  const nextColor =
    color || PROFILE_COLORS[data.profiles.length % PROFILE_COLORS.length];
  const profile: Profile = {
    id,
    name: trimmed,
    color: nextColor,
    channels: [],
  };
  const next: ChannelsFile = { profiles: [...data.profiles, profile] };
  await putChannelsFile(next, sha, `chore: add profile ${trimmed}`);
  return next;
}

export async function updateProfile(
  profileId: string,
  updates: { name?: string; color?: string },
): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  requireProfile(data, profileId);
  const nextName = updates.name?.trim();
  const next: ChannelsFile = {
    profiles: data.profiles.map((p) => {
      if (p.id !== profileId) return p;
      return {
        ...p,
        name: nextName || p.name,
        color: updates.color || p.color,
      };
    }),
  };
  await putChannelsFile(next, sha, `chore: update profile ${nextName || profileId}`);
  return next;
}

export async function removeProfile(profileId: string): Promise<ChannelsFile> {
  const { sha, data } = await getChannelsFile();
  const target = requireProfile(data, profileId);
  if (data.profiles.length <= 1) {
    throw new Error("Cannot remove the last profile.");
  }
  const next: ChannelsFile = {
    profiles: data.profiles.filter((p) => p.id !== profileId),
  };
  await putChannelsFile(next, sha, `chore: remove profile ${target.name}`);
  return next;
}

import { readFileSync } from "fs";
import { join } from "path";
import type { Channel, ChannelsFile, LegacyChannelsFile, Profile } from "./types";
import { PROFILE_COLORS } from "./types";

const CHANNELS_PATH = join(process.cwd(), "channels.json");

export function normalizeChannelsFile(raw: unknown): ChannelsFile {
  if (!raw || typeof raw !== "object") {
    return { profiles: [] };
  }

  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj.profiles)) {
    const profiles: Profile[] = obj.profiles
      .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
      .map((p, i) => ({
        id: typeof p.id === "string" && p.id ? p.id : `profile-${i + 1}`,
        name: typeof p.name === "string" && p.name.trim() ? p.name.trim() : `Kid ${i + 1}`,
        color:
          typeof p.color === "string" && p.color
            ? p.color
            : PROFILE_COLORS[i % PROFILE_COLORS.length],
        channels: Array.isArray(p.channels) ? (p.channels as Channel[]) : [],
      }));
    return { profiles };
  }

  const legacy = raw as LegacyChannelsFile;
  if (Array.isArray(legacy.channels)) {
    return {
      profiles: [
        {
          id: "profile-1",
          name: "Kid 1",
          color: PROFILE_COLORS[0],
          channels: legacy.channels,
        },
      ],
    };
  }

  return { profiles: [] };
}

export function readChannelsFile(): ChannelsFile {
  const raw = readFileSync(CHANNELS_PATH, "utf8");
  return normalizeChannelsFile(JSON.parse(raw));
}

export function listProfiles(): Profile[] {
  return readChannelsFile().profiles;
}

export function getProfile(profileId: string): Profile | undefined {
  return listProfiles().find((p) => p.id === profileId);
}

export function listChannelsForProfile(profileId: string): Channel[] {
  return getProfile(profileId)?.channels ?? [];
}

/** Public summary without channel lists (for the kid picker). */
export function listProfileSummaries(): Pick<Profile, "id" | "name" | "color">[] {
  return listProfiles().map(({ id, name, color }) => ({ id, name, color }));
}

export const CHANNELS_REPO_PATH = "kidtube/channels.json";

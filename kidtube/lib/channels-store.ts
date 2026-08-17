import { readFileSync } from "fs";
import { join } from "path";
import type { Channel, ChannelsFile } from "./types";

const CHANNELS_PATH = join(process.cwd(), "channels.json");

export function readChannelsFile(): ChannelsFile {
  const raw = readFileSync(CHANNELS_PATH, "utf8");
  const parsed = JSON.parse(raw) as ChannelsFile;
  if (!parsed || !Array.isArray(parsed.channels)) {
    return { channels: [] };
  }
  return parsed;
}

export function listChannels(): Channel[] {
  return readChannelsFile().channels;
}

export const CHANNELS_REPO_PATH = "kidtube/channels.json";

export type Channel = {
  id: string;
  name: string;
  thumbnail: string;
};

export type Profile = {
  id: string;
  name: string;
  color: string;
  channels: Channel[];
};

export type ChannelsFile = {
  profiles: Profile[];
};

/** Legacy flat shape before profiles existed. */
export type LegacyChannelsFile = {
  channels: Channel[];
};

export type Video = {
  id: string;
  title: string;
  thumb: string;
  publishedAt: string;
  channel: Channel;
};

export const PROFILE_COLORS = [
  "#FFC24B",
  "#0E7A6E",
  "#FF6B57",
  "#5B8DEF",
  "#9B59B6",
  "#E67E22",
] as const;

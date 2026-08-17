export type Channel = {
  id: string;
  name: string;
  thumbnail: string;
};

export type ChannelsFile = {
  channels: Channel[];
};

export type Video = {
  id: string;
  title: string;
  thumb: string;
  publishedAt: string;
  channel: Channel;
};

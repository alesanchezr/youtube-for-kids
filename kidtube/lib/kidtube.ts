// KidTube design system — "Sunny Lagoon" palette
export const kt = {
  cream: "#FFF6E9", // warm paper background
  creamDeep: "#FFEBD0",
  teal: "#0E7A6E", // brand deep teal
  tealSoft: "#E0F2EE",
  coral: "#FF6B57", // playful accent
  coralSoft: "#FFE3DD",
  sun: "#FFC24B",
  ink: "#26413C", // deep green-ink text
  inkSoft: "#5E7B74",
};

export type Channel = { id: string; name: string; avatar: string };

// Mock data — replaced by channels.json + /api/videos in the real build.
export const channels: Channel[] = [
  { id: "c1", name: "Tiny Lab Science", avatar: "/images/avatar-science.jpg" },
  { id: "c2", name: "Owl & Ember Storytime", avatar: "/images/avatar-story.jpg" },
  { id: "c3", name: "Wildwood Friends", avatar: "/images/avatar-animals.jpg" },
  { id: "c4", name: "Rocket Ranger Club", avatar: "/images/avatar-space.jpg" },
];

export type Video = { id: string; title: string; thumb: string; channel: Channel };

export const videos: Video[] = [
  { id: "v1", title: "Make a Fizzy Volcano at Home!", thumb: "/images/thumb-volcano.jpg", channel: channels[0] },
  { id: "v2", title: "Baby Otters Hold Hands While They Sleep", thumb: "/images/thumb-otters.jpg", channel: channels[2] },
  { id: "v3", title: "The Dragon Who Lived in a Book", thumb: "/images/thumb-storybook.jpg", channel: channels[1] },
  { id: "v4", title: "3… 2… 1… Blast Off to the Moon!", thumb: "/images/thumb-rocket.jpg", channel: channels[3] },
  { id: "v5", title: "Dinosaur Picnic Party", thumb: "/images/thumb-dinos.jpg", channel: channels[2] },
  { id: "v6", title: "Counting to Ten with Ladybugs", thumb: "/images/thumb-ladybugs.jpg", channel: channels[0] },
  { id: "v7", title: "Ollie the Octopus Paints a Rainbow", thumb: "/images/thumb-octopus.jpg", channel: channels[1] },
  { id: "v8", title: "Let's Bake Giant Cookies Together", thumb: "/images/thumb-baking.jpg", channel: channels[2] },
];

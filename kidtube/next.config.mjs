/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Mock phase serves local images; YouTube thumbnails can be added later:
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }, { protocol: "https", hostname: "yt3.ggpht.com" }],
  },
};

export default nextConfig;

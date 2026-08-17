import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import withPWAInit from "@ducanh2912/next-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function gitCommitCount() {
  try {
    return execSync("git rev-list --count HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      cwd: path.join(__dirname, ".."),
    }).trim();
  } catch {
    return "0";
  }
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "yt-thumbnails",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /^https:\/\/yt3\.(ggpht|googleusercontent)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "yt-avatars",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /\/api\/videos.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-videos",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  env: {
    NEXT_PUBLIC_APP_VERSION: gitCommitCount(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
    ],
  },
};

export default withPWA(nextConfig);

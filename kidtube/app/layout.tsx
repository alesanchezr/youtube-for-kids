import type { Metadata, Viewport } from "next";
import { kt } from "@/lib/kidtube";
import "./globals.css";

export const metadata: Metadata = {
  title: "KidTube",
  description: "A kid-safe video app that only shows channels your family picked.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "KidTube" },
};

export const viewport: Viewport = {
  themeColor: "#0E7A6E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-[100dvh] w-full antialiased"
        style={{ backgroundColor: kt.cream, color: kt.ink, fontFamily: "'Nunito', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}

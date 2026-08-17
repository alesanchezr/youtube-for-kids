import { NextResponse } from "next/server";
import { clientIp, verifyPin } from "@/lib/pin";
import { fetchChannelUploads } from "@/lib/youtube";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim();
  const name = (searchParams.get("name") || "Channel").trim();
  const thumbnail = (searchParams.get("thumbnail") || "").trim();
  const pin = searchParams.get("pin") || request.headers.get("x-admin-pin") || "";

  const auth = verifyPin(pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!id.startsWith("UC")) {
    return NextResponse.json({ error: "Valid YouTube channel id required." }, { status: 400 });
  }

  try {
    const channel = { id, name, thumbnail };
    const videos = await fetchChannelUploads(channel, 24);
    return NextResponse.json({ channel, videos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load channel videos";
    console.error("/api/channel-videos", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

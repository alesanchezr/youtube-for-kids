import { NextResponse } from "next/server";
import { clientIp, verifyPin } from "@/lib/pin";
import { searchChannels } from "@/lib/youtube";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const pin = searchParams.get("pin") || request.headers.get("x-admin-pin") || "";

  const auth = verifyPin(pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (q.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters." }, { status: 400 });
  }

  try {
    const results = await searchChannels(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("/api/search-channel", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

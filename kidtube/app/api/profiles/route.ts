import { NextResponse } from "next/server";
import { listProfileSummaries, listProfiles } from "@/lib/channels-store";
import { clientIp, verifyPin } from "@/lib/pin";

export const runtime = "nodejs";

/** Public: kid picker only needs id/name/color. */
export async function GET() {
  try {
    return NextResponse.json({ profiles: listProfileSummaries() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load profiles";
    console.error("/api/profiles GET", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Authenticated: full profiles including channels (manage). */
export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const auth = verifyPin(body.pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({ profiles: listProfiles() });
}

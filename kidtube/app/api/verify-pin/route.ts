import { NextResponse } from "next/server";
import { listChannels } from "@/lib/channels-store";
import { clientIp, verifyPin } from "@/lib/pin";

export const runtime = "nodejs";

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

  return NextResponse.json({ ok: true, channels: listChannels() });
}

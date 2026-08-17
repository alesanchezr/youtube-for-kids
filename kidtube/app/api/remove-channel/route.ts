import { NextResponse } from "next/server";
import { removeChannel } from "@/lib/github";
import { clientIp, verifyPin } from "@/lib/pin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: { pin?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const auth = verifyPin(body.pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const data = await removeChannel(body.id);
    return NextResponse.json({
      channels: data.channels,
      status: "pending_deploy",
      message: "Channel removed. Kid view updates after redeploy (~1–2 min).",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove channel";
    console.error("/api/remove-channel", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

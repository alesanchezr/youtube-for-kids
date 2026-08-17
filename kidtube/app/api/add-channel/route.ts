import { NextResponse } from "next/server";
import { addChannel } from "@/lib/github";
import { clientIp, verifyPin } from "@/lib/pin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: { pin?: string; id?: string; name?: string; thumbnail?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const auth = verifyPin(body.pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required." }, { status: 400 });
  }

  try {
    const data = await addChannel({
      id: body.id,
      name: body.name,
      thumbnail: body.thumbnail || "",
    });
    return NextResponse.json({
      channels: data.channels,
      status: "pending_deploy",
      message: "Channel added. Kid view updates after redeploy (~1–2 min).",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add channel";
    console.error("/api/add-channel", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

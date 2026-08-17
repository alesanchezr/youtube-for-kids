import { NextResponse } from "next/server";
import { addProfile } from "@/lib/github";
import { clientIp, verifyPin } from "@/lib/pin";
import { PROFILE_COLORS } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: { pin?: string; name?: string; color?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const auth = verifyPin(body.pin, ip);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const color =
    body.color && PROFILE_COLORS.includes(body.color as (typeof PROFILE_COLORS)[number])
      ? body.color
      : undefined;

  try {
    const data = await addProfile(name, color);
    return NextResponse.json({
      profiles: data.profiles,
      status: "pending_deploy",
      message: "Profile added. Kid view updates after redeploy (~1–2 min).",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add profile";
    console.error("/api/add-profile", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

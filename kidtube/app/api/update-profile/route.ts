import { NextResponse } from "next/server";
import { updateProfile } from "@/lib/github";
import { getProfile } from "@/lib/channels-store";
import { clientIp, verifyPin } from "@/lib/pin";
import { PROFILE_COLORS } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: { pin?: string; id?: string; name?: string; color?: string };
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

  if (!getProfile(body.id)) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const updates: { name?: string; color?: string } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (body.color && PROFILE_COLORS.includes(body.color as (typeof PROFILE_COLORS)[number])) {
    updates.color = body.color;
  }

  if (!updates.name && !updates.color) {
    return NextResponse.json({ error: "name or color is required." }, { status: 400 });
  }

  try {
    const data = await updateProfile(body.id, updates);
    return NextResponse.json({
      profiles: data.profiles,
      status: "pending_deploy",
      message: "Profile updated. Kid view updates after redeploy (~1–2 min).",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    console.error("/api/update-profile", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

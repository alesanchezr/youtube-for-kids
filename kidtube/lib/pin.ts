const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("ADMIN_PIN is not configured");
  return pin;
}

export function checkPinRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function recordPinFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearPinFailures(ip: string) {
  attempts.delete(ip);
}

export function verifyPin(pin: unknown, ip: string): { ok: true } | { ok: false; status: number; error: string } {
  const limit = checkPinRateLimit(ip);
  if (!limit.ok) {
    return { ok: false, status: 429, error: `Too many attempts. Try again in ${limit.retryAfterSec}s.` };
  }

  let expected: string;
  try {
    expected = getAdminPin();
  } catch {
    return { ok: false, status: 500, error: "Server PIN is not configured." };
  }

  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    recordPinFailure(ip);
    return { ok: false, status: 401, error: "Invalid PIN." };
  }

  if (pin !== expected) {
    recordPinFailure(ip);
    return { ok: false, status: 401, error: "Incorrect PIN." };
  }

  clearPinFailures(ip);
  return { ok: true };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

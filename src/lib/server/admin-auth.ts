import { createServerFn } from "@tanstack/react-start";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { sendLoginNotificationEmail } from "@/lib/server/email";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "trusthouse-admin-jwt-secret-key-2026-auth-protection",
);

export const DEFAULT_ADMIN = {
  email: "admin@admin.com",
  password: "admin123",
};

/** Verify signed admin token. Returns payload or null. */
export async function verifyAdminToken(token: string | null | undefined): Promise<{ email: string; role: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    if (payload.role === "admin" && typeof payload.email === "string") {
      return { email: payload.email, role: "admin" };
    }
  } catch {
    return null;
  }
  return null;
}

/** Assert admin auth token on server function execution. */
export async function assertAdminAuth(token?: string | null): Promise<{ email: string; role: string }> {
  const verified = await verifyAdminToken(token);
  if (!verified) {
    throw new Error("Unauthorized: Valid admin authentication token required.");
  }
  return verified;
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

/** Server function: Admin Login */
export const adminLoginServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }): Promise<{ success: boolean; token: string; user: { email: string; role: string } }> => {
    const email = data.email.toLowerCase();
    const sql = await getSql();

    // Check admin_users in DB or check default credentials
    let isValid = false;
    try {
      const rows = await sql<{ id: number; email: string; password: string; role: string }>`
        select id, email, password, role from admin_users
        where lower(email) = ${email} limit 1
      `;
      if (rows[0] && rows[0].password === data.password) {
        isValid = true;
      }
    } catch {
      // Table may be migrating, fallback to hardcoded default
    }

    // Default credentials fallback (email: admin@admin.com, password: admin123)
    if (!isValid && email === DEFAULT_ADMIN.email && data.password === DEFAULT_ADMIN.password) {
      isValid = true;
    }

    if (!isValid) {
      throw new Error("Invalid admin email or password. Use admin@admin.com / admin123.");
    }

    // Sign JWT token valid for 7 days
    const token = await new SignJWT({
      email,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(ADMIN_JWT_SECRET);

    // Send login alert email
    void sendLoginNotificationEmail(email, "TrustHouse Admin", "admin").catch(() => {});

    return {
      success: true,
      token,
      user: { email, role: "admin" },
    };
  });

/** Server function: Send login alert for regular agent users */
export const notifyAgentLoginServer = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), name: z.string().optional() }))
  .handler(async ({ data }) => {
    void sendLoginNotificationEmail(data.email, data.name || "TrustHouse Agent", "agent").catch(() => {});
    return { success: true };
  });

/** Server function: Verify existing admin session token */
export const adminVerifySessionServer = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().nullable().optional() }))
  .handler(async ({ data }): Promise<{ valid: boolean; user: { email: string; role: string } | null }> => {
    const verified = await verifyAdminToken(data?.token);
    if (!verified) return { valid: false, user: null };
    return { valid: true, user: verified };
  });

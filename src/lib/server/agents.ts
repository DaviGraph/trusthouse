import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { RESERVED_SLUGS, slugifyName } from "@/lib/format";
import type { Agent } from "@/lib/types";

type AgentRow = {
  user_id: string;
  slug: string;
  display_name: string;
  phone: string;
  bio: string;
};

function mapAgent(row: AgentRow): Agent {
  return {
    userId: row.user_id,
    slug: row.slug,
    displayName: row.display_name,
    phone: row.phone,
    bio: row.bio,
  };
}

async function uniqueSlug(sql: Awaited<ReturnType<typeof getSql>>, base: string, userId: string) {
  let candidate = RESERVED_SLUGS.has(base) ? `${base}-agent` : base;
  for (let i = 0; i < 40; i += 1) {
    const existing = await sql<{ user_id: string }>`
      select user_id from agents where slug = ${candidate} limit 1
    `;
    if (existing.length === 0 || existing[0].user_id === userId) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export const getPublicAgent = createServerFn({ method: "GET" })
  .validator((slug: string) => slug.trim().toLowerCase())
  .handler(async ({ data: slug }): Promise<Agent | null> => {
    if (!slug || RESERVED_SLUGS.has(slug)) return null;
    const sql = await getSql();
    const rows = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio from agents where slug = ${slug} limit 1
    `;
    return rows[0] ? mapAgent(rows[0]) : null;
  });

export const getMyAgent = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Agent | null> => {
    const sql = await getSql();
    const rows = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio
      from agents where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? mapAgent(rows[0]) : null;
  });

const upsertSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional().default(""),
  bio: z.string().trim().max(400).optional().default(""),
});

export const ensureAgentProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => upsertSchema.parse(input))
  .handler(async ({ context, data }): Promise<Agent> => {
    const sql = await getSql();
    const existing = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio
      from agents where user_id = ${context.userId} limit 1
    `;
    if (existing[0]) {
      const phone = data.phone || existing[0].phone;
      const bio = data.bio || existing[0].bio;
      const name = data.displayName || existing[0].display_name;
      await sql`
        update agents
        set display_name = ${name}, phone = ${phone}, bio = ${bio}
        where user_id = ${context.userId}
      `;
      return {
        userId: context.userId,
        slug: existing[0].slug,
        displayName: name,
        phone,
        bio,
      };
    }
    const slug = await uniqueSlug(sql, slugifyName(data.displayName), context.userId);
    await sql`
      insert into agents (user_id, slug, display_name, phone, bio)
      values (${context.userId}, ${slug}, ${data.displayName}, ${data.phone ?? ""}, ${data.bio ?? ""})
    `;
    return {
      userId: context.userId,
      slug,
      displayName: data.displayName,
      phone: data.phone ?? "",
      bio: data.bio ?? "",
    };
  });

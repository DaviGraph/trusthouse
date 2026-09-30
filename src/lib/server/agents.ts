import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { RESERVED_SLUGS, slugifyName } from "@/lib/format";
import type { Agent, IdVerificationStatus } from "@/lib/types";

type AgentRow = {
  user_id: string;
  slug: string;
  display_name: string;
  phone: string;
  bio: string;
  avatar_url?: string | null;
  id_document_url?: string | null;
  id_verification_status?: string | null;
};

function mapAgent(row: AgentRow): Agent {
  return {
    userId: row.user_id,
    slug: row.slug,
    displayName: row.display_name,
    phone: row.phone ?? "",
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? null,
    idDocumentUrl: row.id_document_url ?? null,
    idVerificationStatus: (row.id_verification_status as IdVerificationStatus) ?? "not_submitted",
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
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      from agents where slug = ${slug} limit 1
    `;
    return rows[0] ? mapAgent(rows[0]) : null;
  });

export const getMyAgent = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Agent | null> => {
    const sql = await getSql();
    const rows = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      from agents where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? mapAgent(rows[0]) : null;
  });

const getProfileValidator = (input: unknown) => {
  if (typeof input === "string") return { agentId: input.trim() };
  if (input && typeof input === "object" && "agentId" in input) {
    return { agentId: String((input as { agentId?: unknown }).agentId ?? "").trim() || undefined };
  }
  return {};
};

/**
 * Fetch current profile fields for an agent.
 * Protected: Only accessible when logged in as the agent themselves.
 */
export const getAgentProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(getProfileValidator)
  .handler(async ({ context, data }): Promise<Agent | null> => {
    const targetId = data?.agentId || context.userId;
    if (targetId !== context.userId) {
      throw new Error("Unauthorized: You can only access your own agent profile.");
    }
    const sql = await getSql();
    const rows = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      from agents where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? mapAgent(rows[0]) : null;
  });

const updateAgentProfileSchema = z
  .object({
    agentId: z.string().trim().min(1).optional(),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be at most 80 characters")
      .optional(),
    displayName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be at most 80 characters")
      .optional(),
    phone: z.string().trim().max(30, "Phone number is too long").optional().default(""),
    bio: z.string().trim().max(1000, "Bio must be at most 1000 characters").optional().default(""),
    avatarUrl: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.fullName || data.displayName, {
    message: "Full name is required",
    path: ["displayName"],
  });

/**
 * Update editable profile fields (full name, phone, bio, optional avatarUrl).
 * Protected: Only accessible when logged in as the agent themselves.
 */
export const updateAgentProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateAgentProfileSchema.parse(input))
  .handler(async ({ context, data }): Promise<Agent> => {
    if (data.agentId && data.agentId !== context.userId) {
      throw new Error("Unauthorized: You can only update your own agent profile.");
    }
    const name = (data.fullName || data.displayName)!.trim();
    const sql = await getSql();

    const existing = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      from agents where user_id = ${context.userId} limit 1
    `;

    if (!existing[0]) {
      const slug = await uniqueSlug(sql, slugifyName(name), context.userId);
      const rows = await sql<AgentRow>`
        insert into agents (user_id, slug, display_name, phone, bio, avatar_url)
        values (${context.userId}, ${slug}, ${name}, ${data.phone ?? ""}, ${data.bio ?? ""}, ${data.avatarUrl ?? null})
        returning user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      `;
      return mapAgent(rows[0]);
    }

    if (data.avatarUrl !== undefined) {
      const rows = await sql<AgentRow>`
        update agents
        set display_name = ${name},
            phone = ${data.phone ?? ""},
            bio = ${data.bio ?? ""},
            avatar_url = ${data.avatarUrl}
        where user_id = ${context.userId}
        returning user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      `;
      return mapAgent(rows[0]);
    }

    const rows = await sql<AgentRow>`
      update agents
      set display_name = ${name},
          phone = ${data.phone ?? ""},
          bio = ${data.bio ?? ""}
      where user_id = ${context.userId}
      returning user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
    `;
    return mapAgent(rows[0]);
  });

const uploadIdDocSchema = z
  .object({
    agentId: z.string().trim().min(1).optional(),
    documentUrl: z.string().trim().optional(),
    fileUrl: z.string().trim().optional(),
    file: z.string().trim().optional(),
  })
  .refine((d) => d.documentUrl || d.fileUrl || d.file, {
    message: "Document file or URL is required",
    path: ["documentUrl"],
  });

/**
 * Upload/record an agent's government ID document scan and set status to 'pending_review'.
 * Protected: Only accessible when logged in as the agent themselves.
 * NOTE: Does NOT auto-verify — marks as pending review for admin verification.
 */
export const uploadAgentIdDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => uploadIdDocSchema.parse(input))
  .handler(async ({ context, data }): Promise<Agent> => {
    if (data.agentId && data.agentId !== context.userId) {
      throw new Error("Unauthorized: You can only submit verification for your own account.");
    }
    const docUrl = (data.documentUrl || data.fileUrl || data.file)!;
    const sql = await getSql();

    const existing = await sql<AgentRow>`
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      from agents where user_id = ${context.userId} limit 1
    `;

    if (!existing[0]) {
      const slug = await uniqueSlug(sql, "agent", context.userId);
      const rows = await sql<AgentRow>`
        insert into agents (user_id, slug, display_name, phone, bio, id_document_url, id_verification_status)
        values (${context.userId}, ${slug}, 'Agent', '', '', ${docUrl}, 'pending_review')
        returning user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
      `;
      return mapAgent(rows[0]);
    }

    const rows = await sql<AgentRow>`
      update agents
      set id_document_url = ${docUrl},
          id_verification_status = 'pending_review'
      where user_id = ${context.userId}
      returning user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
    `;
    return mapAgent(rows[0]);
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
      select user_id, slug, display_name, phone, bio, avatar_url, id_document_url, id_verification_status
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
        avatarUrl: existing[0].avatar_url ?? null,
        idDocumentUrl: existing[0].id_document_url ?? null,
        idVerificationStatus: (existing[0].id_verification_status as IdVerificationStatus) ?? "not_submitted",
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
      avatarUrl: null,
      idDocumentUrl: null,
      idVerificationStatus: "not_submitted",
    };
  });

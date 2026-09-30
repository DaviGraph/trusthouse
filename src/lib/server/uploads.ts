import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { storageAdmin } from "@/lib/storage.server";

const photoInput = z.object({ fileName: z.string().min(1).max(200) });
const videoInput = z.object({ listingId: z.coerce.number().int().positive(), fileName: z.string().min(1).max(200) });

export const createPhotoUploadUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => photoInput.parse(input))
  .handler(async ({ context, data }) => {
    const ext = data.fileName.split(".").pop() || "jpg";
    const path = `${context.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: signed, error } = await storageAdmin.storage
      .from("listing-photos")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Could not prepare upload.");
    const { data: pub } = storageAdmin.storage.from("listing-photos").getPublicUrl(path);
    return { path, token: signed.token, publicUrl: pub.publicUrl };
  });

export const createVideoUploadUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => videoInput.parse(input))
  .handler(async ({ context, data }) => {
    const ext = data.fileName.split(".").pop() || "mp4";
    const path = `${context.userId}/${data.listingId}-${Date.now()}.${ext}`;
    const { data: signed, error } = await storageAdmin.storage
      .from("verification-videos")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Could not prepare upload.");
    return { path, token: signed.token };
  });

export const createAvatarUploadUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => photoInput.parse(input))
  .handler(async ({ context, data }) => {
    const ext = data.fileName.split(".").pop() || "jpg";
    const path = `${context.userId}/avatar-${Date.now()}.${ext}`;
    const { data: signed, error } = await storageAdmin.storage
      .from("agent-avatars")
      .createSignedUploadUrl(path);
    if (error || !signed) {
      const { data: fallback, error: fbError } = await storageAdmin.storage
        .from("listing-photos")
        .createSignedUploadUrl(`avatars/${path}`);
      if (fbError || !fallback) throw new Error(error?.message ?? fbError?.message ?? "Could not prepare avatar upload.");
      const { data: pub } = storageAdmin.storage.from("listing-photos").getPublicUrl(`avatars/${path}`);
      return { path: `avatars/${path}`, token: fallback.token, publicUrl: pub.publicUrl, bucket: "listing-photos" };
    }
    const { data: pub } = storageAdmin.storage.from("agent-avatars").getPublicUrl(path);
    return { path, token: signed.token, publicUrl: pub.publicUrl, bucket: "agent-avatars" };
  });

export const createIdDocumentUploadUrl = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => photoInput.parse(input))
  .handler(async ({ context, data }) => {
    const ext = data.fileName.split(".").pop() || "jpg";
    const path = `${context.userId}/id-${Date.now()}.${ext}`;
    const { data: signed, error } = await storageAdmin.storage
      .from("verification-documents")
      .createSignedUploadUrl(path);
    if (error || !signed) {
      const { data: fallback, error: fbError } = await storageAdmin.storage
        .from("listing-photos")
        .createSignedUploadUrl(`id-documents/${path}`);
      if (fbError || !fallback) throw new Error(error?.message ?? fbError?.message ?? "Could not prepare ID document upload.");
      const { data: pub } = storageAdmin.storage.from("listing-photos").getPublicUrl(`id-documents/${path}`);
      return { path: `id-documents/${path}`, token: fallback.token, publicUrl: pub.publicUrl, bucket: "listing-photos" };
    }
    const { data: pub } = storageAdmin.storage.from("verification-documents").getPublicUrl(path);
    return { path, token: signed.token, publicUrl: pub.publicUrl, bucket: "verification-documents" };
  });
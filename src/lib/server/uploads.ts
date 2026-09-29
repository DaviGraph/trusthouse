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
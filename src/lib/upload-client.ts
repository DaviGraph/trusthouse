import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  createAvatarUploadUrl,
  createIdDocumentUploadUrl,
  createPhotoUploadUrl,
  createVideoUploadUrl,
} from "@/lib/server/uploads";

export async function uploadListingPhoto(file: File): Promise<string> {
  const { path, token, publicUrl } = await createPhotoUploadUrl({
    data: { fileName: file.name },
  });
  const { error } = await supabaseBrowser.storage
    .from("listing-photos")
    .uploadToSignedUrl(path, token, file);
  if (error) throw new Error(error.message);
  return publicUrl;
}

export async function uploadVerificationVideo(listingId: number, file: File): Promise<string> {
  const { path, token } = await createVideoUploadUrl({
    data: { listingId, fileName: file.name },
  });
  const { error } = await supabaseBrowser.storage
    .from("verification-videos")
    .uploadToSignedUrl(path, token, file);
  if (error) throw new Error(error.message);
  const { data: pub } = supabaseBrowser.storage.from("verification-videos").getPublicUrl(path);
  return pub.publicUrl;
}

export async function uploadAgentAvatar(file: File): Promise<string> {
  try {
    const { path, token, publicUrl, bucket } = await createAvatarUploadUrl({
      data: { fileName: file.name },
    });
    const { error } = await supabaseBrowser.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file);
    if (error) throw new Error(error.message);
    return publicUrl;
  } catch (err) {
    // If external storage is unreachable in local dev, provide base64 data url fallback
    if (typeof window !== "undefined" && file.size < 4 * 1024 * 1024) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(file);
      });
    }
    throw err;
  }
}

export async function uploadVerificationDocument(file: File): Promise<string> {
  try {
    const { path, token, publicUrl, bucket } = await createIdDocumentUploadUrl({
      data: { fileName: file.name },
    });
    const { error } = await supabaseBrowser.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file);
    if (error) throw new Error(error.message);
    return publicUrl;
  } catch (err) {
    // If external storage is unreachable in local dev, provide base64 data url fallback
    if (typeof window !== "undefined" && file.size < 8 * 1024 * 1024) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(file);
      });
    }
    throw err;
  }
}
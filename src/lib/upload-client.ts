import { supabaseBrowser } from "@/lib/supabase-browser";
import { createPhotoUploadUrl, createVideoUploadUrl } from "@/lib/server/uploads";

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
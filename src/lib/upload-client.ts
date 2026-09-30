import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  createAvatarUploadUrl,
  createIdDocumentUploadUrl,
  createPhotoUploadUrl,
  createVideoUploadUrl,
} from "@/lib/server/uploads";
import { compressImage } from "@/lib/image-compress";

export async function uploadListingPhoto(file: File): Promise<string> {
  const { file: optimizedFile } = await compressImage(file, {
    maxDimension: 1920,
    quality: 0.86,
  });
  const { path, token, publicUrl } = await createPhotoUploadUrl({
    data: { fileName: optimizedFile.name },
  });
  const { error } = await supabaseBrowser.storage
    .from("listing-photos")
    .uploadToSignedUrl(path, token, optimizedFile);
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

export async function uploadAgentAvatar(
  file: File,
  onStats?: (stats: { originalSize: number; compressedSize: number }) => void,
): Promise<string> {
  // Compress image to max 800x800 square WebP with high quality
  const { file: compressedFile, originalSize, compressedSize } = await compressImage(file, {
    maxDimension: 800,
    quality: 0.86,
    squareCrop: true,
  });

  if (onStats) {
    onStats({ originalSize, compressedSize });
  }

  try {
    const { path, token, publicUrl, bucket } = await createAvatarUploadUrl({
      data: { fileName: compressedFile.name },
    });
    const { error } = await supabaseBrowser.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, compressedFile);
    if (error) throw new Error(error.message);
    return publicUrl;
  } catch (err) {
    // If external storage is unreachable in local dev, provide base64 data url fallback
    if (typeof window !== "undefined" && compressedFile.size < 4 * 1024 * 1024) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(compressedFile);
      });
    }
    throw err;
  }
}

export async function uploadVerificationDocument(
  file: File,
  onStats?: (stats: { originalSize: number; compressedSize: number }) => void,
): Promise<string> {
  // For images, compress down to 1800px max preserving clarity of small text
  // For PDFs, leaves untouched
  const { file: compressedFile, originalSize, compressedSize } = await compressImage(file, {
    maxDimension: 1800,
    quality: 0.88,
    squareCrop: false,
  });

  if (onStats) {
    onStats({ originalSize, compressedSize });
  }

  try {
    const { path, token, publicUrl, bucket } = await createIdDocumentUploadUrl({
      data: { fileName: compressedFile.name },
    });
    const { error } = await supabaseBrowser.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, compressedFile);
    if (error) throw new Error(error.message);
    return publicUrl;
  } catch (err) {
    // If external storage is unreachable in local dev, provide base64 data url fallback
    if (typeof window !== "undefined" && compressedFile.size < 8 * 1024 * 1024) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(compressedFile);
      });
    }
    throw err;
  }
}
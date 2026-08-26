const MAX_DIMENSION = 2400;
const MAX_UNTOUCHED_BYTES = 3.5 * 1024 * 1024;

function renameExtension(filename: string, extension: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return `${base}.${extension}`;
}

// Vercel Functions cap request bodies around 4.5MB, so large 2K/4K photos need to be
// downscaled client-side before upload or they fail outright.
export async function downscaleImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);

    if (file.size <= MAX_UNTOUCHED_BYTES && longestSide <= MAX_DIMENSION) {
      bitmap.close();
      return file;
    }

    const scale = Math.min(1, MAX_DIMENSION / longestSide);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));

    if (!blob) {
      return file;
    }

    return new File([blob], renameExtension(file.name, "webp"), { type: "image/webp" });
  } catch {
    return file;
  }
}

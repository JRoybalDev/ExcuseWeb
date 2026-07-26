import { join } from "node:path";
import sharp from "sharp";

const THUMBNAIL_WIDTH = 640;

export async function createThumbnail(file: File, uploadDir: string): Promise<{ url: string } | undefined> {
  if (!file.type.startsWith("image/")) {
    return undefined;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const thumbnail = await sharp(buffer)
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${crypto.randomUUID()}-thumb.webp`;
  await Bun.write(join(uploadDir, filename), thumbnail);

  return { url: `/uploads/${filename}` };
}

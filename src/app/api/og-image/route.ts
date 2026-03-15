import { NextResponse } from "next/server";

const SOURCE_IMAGE =
  "https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/ChannelArt/channel-art.png";

// Tweak these to control the crop:
// The crop window is expressed as fractions of the original image dimensions.
// e.g. cropX: 0.1 means start 10% from the left edge.
const CROP = {
  x: 0.15,      // start 15% from the left
  y: 0.1,       // start 10% from the top
  width: 0.70,  // crop 70% of the width
  height: 0.80, // crop 80% of the height
};

// Output dimensions (standard OG size)
const OUT_W = 1200;
const OUT_H = 630;

export async function GET() {
  try {
    const res = await fetch(SOURCE_IMAGE, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error("Failed to fetch source image");

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = res.headers.get("content-type") ?? "image/png";

    // We use an SVG with a nested <image> and a viewBox to simulate cropping.
    // The viewBox clips to our desired region; the image is scaled to fill it.
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${OUT_W}" height="${OUT_H}"
     viewBox="0 0 ${OUT_W} ${OUT_H}">
  <image
    href="data:${mimeType};base64,${base64}"
    x="${-CROP.x * (OUT_W / CROP.width)}"
    y="${-CROP.y * (OUT_H / CROP.height)}"
    width="${OUT_W / CROP.width}"
    height="${OUT_H / CROP.height}"
    preserveAspectRatio="xMidYMid slice"
  />
</svg>`.trim();

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("OG image error:", err);
    return new NextResponse("Failed to generate OG image", { status: 500 });
  }
}

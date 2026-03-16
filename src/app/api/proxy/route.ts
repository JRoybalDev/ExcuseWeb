import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const targetUrl = new URL(url);

    // Only allow your specific domain to prevent open proxy abuse
    if (!targetUrl.hostname.includes("arcon-api.duckdns.org")) {
      return new NextResponse("Forbidden: Domain not allowed", { status: 403 });
    }

    const response = await fetch(targetUrl.toString());

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image`, { status: response.status });
    }

    const contentType = response.headers.get("Content-Type") || "application/octet-stream";

    // Forward the image with caching headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

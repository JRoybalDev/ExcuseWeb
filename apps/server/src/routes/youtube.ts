import { google } from "googleapis";
import { Hono } from "hono";
import { env } from "../env";
import { fail, ok } from "../http/response";
import type { AppVariables } from "../types";

export const youtubeRoute = new Hono<{ Variables: AppVariables }>();

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
};

function assertConfigured() {
  if (!env.youtubeApiKey || !env.youtubeChannelId) {
    throw new Error("YouTube API key or channel id is not configured.");
  }
}

async function fetchLatestVideos(maxResults: number): Promise<YouTubeVideo[]> {
  assertConfigured();

  const youtube = google.youtube({ version: "v3", auth: env.youtubeApiKey });
  const uploadsPlaylistId = env.youtubeChannelId!.replace(/^UC/, "UU");

  const response = await youtube.playlistItems.list({
    part: ["snippet"],
    playlistId: uploadsPlaylistId,
    maxResults
  });

  return (response.data.items ?? [])
    .map((item) => {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) {
        return null;
      }

      return {
        id: videoId,
        title: item.snippet?.title ?? "Untitled",
        thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? "",
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    })
    .filter((video): video is YouTubeVideo => video !== null);
}

youtubeRoute.get("/latest", async (c) => {
  try {
    const videos = await fetchLatestVideos(5);
    return ok(c, videos);
  } catch (error) {
    return fail(c, error instanceof Error ? error.message : "Failed to fetch videos from YouTube.", 500, { code: "YOUTUBE_FETCH_FAILED" });
  }
});

youtubeRoute.get("/popular", async (c) => {
  try {
    assertConfigured();

    const recent = await fetchLatestVideos(25);
    if (recent.length === 0) {
      return ok(c, []);
    }

    const youtube = google.youtube({ version: "v3", auth: env.youtubeApiKey });
    const stats = await youtube.videos.list({
      part: ["statistics"],
      id: recent.map((video) => video.id)
    });

    const viewCounts = new Map((stats.data.items ?? []).map((item) => [item.id ?? "", Number(item.statistics?.viewCount ?? 0)]));

    const popular = [...recent].sort((a, b) => (viewCounts.get(b.id) ?? 0) - (viewCounts.get(a.id) ?? 0)).slice(0, 5);

    return ok(c, popular);
  } catch (error) {
    return fail(c, error instanceof Error ? error.message : "Failed to fetch videos from YouTube.", 500, { code: "YOUTUBE_FETCH_FAILED" });
  }
});

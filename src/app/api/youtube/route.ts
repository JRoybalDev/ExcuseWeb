import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.error('YouTube API key or Channel ID is not configured.');
    return NextResponse.json(
      { error: 'YouTube API key or Channel ID is not configured.' },
      { status: 500 },
    );
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY,
    });

    // The "uploads" playlist ID for any channel can be derived by replacing "UC" with "UU"
    const uploadsPlaylistId = YOUTUBE_CHANNEL_ID.replace(/^UC/, 'UU');

    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: 5,
    });

    const videos =
      response.data.items
        ?.map((item) => {
          const videoId = item.snippet?.resourceId?.videoId;
          if (!videoId) return null;

          return {
            id: videoId,
            title: item.snippet?.title ?? 'Untitled',
            thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? '',
            url: `https://www.youtube.com/watch?v=${videoId}`,
          };
        })
        .filter(Boolean) ?? [];

    return NextResponse.json(videos);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos from YouTube.' }, { status: 500 });
  }
}

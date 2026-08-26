import type { YouTubeVideo } from "./apiClient";

export function VideoSection({
  title,
  videos,
  isLoading,
  error
}: {
  title: string;
  videos?: YouTubeVideo[];
  isLoading: boolean;
  error: boolean;
}) {
  return (
    <section className="videos-section">
      <h2 className="videos-title">{title}</h2>
      {isLoading ? <p className="videos-status">Loading videos...</p> : null}
      {error ? <p className="videos-status videos-status--error">Unable to load videos right now.</p> : null}
      {!isLoading && !error ? (
        videos && videos.length > 0 ? (
          <div className="videos-grid">
            {videos.map((video) => (
              <a key={video.id} className="video-card" href={video.url} target="_blank" rel="noopener noreferrer">
                <div className="video-card__thumb">
                  <img src={video.thumbnailUrl} alt="" />
                </div>
                <p className="video-card__title">{video.title}</p>
              </a>
            ))}
          </div>
        ) : (
          <p className="videos-status">No videos found.</p>
        )
      ) : null}
    </section>
  );
}

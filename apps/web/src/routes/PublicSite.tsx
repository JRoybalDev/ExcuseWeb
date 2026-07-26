import { scheduleDayLabels, scheduleDayValues, scheduleEntryTypeLabels, type ScheduleDay, type ScheduleEntry } from "@fullstack-template/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FaDiscord, FaInstagram, FaTiktok, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { apiClient, type YouTubeVideo } from "../shared/apiClient";
import { setDocumentTitle, setSiteFavicon, siteConfig } from "../shared/siteConfig";

const CHANNEL_NAME = "ExcuseMeImJack";

const LOGO_URL = "/logo.png";
const BACKGROUND_URL = "/background.jpg";
const QR_CODE_URL = "/discord-qr.png";
const DISCORD_URL = "https://discord.gg/fKW2eCsqqR";
const NEXT_REMAKE_PERCENT = 0;

const SOCIAL_LINKS = [
  { name: "YouTube", url: "https://youtube.com/@ExcuseMeImJack", icon: FaYoutube },
  { name: "Twitch", url: "https://www.twitch.tv/excusemeimjack", icon: FaTwitch },
  { name: "TikTok", url: "https://www.tiktok.com/@excusemeimjack", icon: FaTiktok },
  { name: "X", url: "https://x.com/excusemeimjack", icon: FaTwitter },
  { name: "Instagram", url: "https://www.instagram.com/excusemeimjack", icon: FaInstagram },
  { name: "Discord", url: DISCORD_URL, icon: FaDiscord }
];

function nextOccurrence(day: ScheduleDay): Date {
  const jsDayIndex: Record<ScheduleDay, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const now = new Date();
  const diff = (jsDayIndex[day] - now.getDay() + 7) % 7;
  const result = new Date(now);
  result.setDate(now.getDate() + diff);
  return result;
}

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function PublicSite() {
  useEffect(() => {
    setDocumentTitle(siteConfig.defaultPageName);
    setSiteFavicon();
  }, []);

  const schedule = useQuery({
    queryKey: ["schedule"],
    queryFn: () => apiClient.schedule.list()
  });

  const latestVideos = useQuery({
    queryKey: ["youtube", "latest"],
    queryFn: () => apiClient.youtube.latest()
  });

  const popularVideos = useQuery({
    queryKey: ["youtube", "popular"],
    queryFn: () => apiClient.youtube.popular()
  });

  const entriesByDay = new Map<ScheduleDay, ScheduleEntry>();
  for (const entry of schedule.data ?? []) {
    entriesByDay.set(entry.dayOfWeek, entry);
  }

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-bg" style={{ backgroundImage: `url(${BACKGROUND_URL})` }} />
      <div className="coming-soon-scrim" />

      <div className="coming-soon-content">
        <section className="coming-soon-hero">
          <span className="coming-soon-eyebrow">{CHANNEL_NAME}</span>
          <img className="coming-soon-avatar" src={LOGO_URL} alt={CHANNEL_NAME} />
          <h1 className="coming-soon-heading">Coming Soon</h1>
          <p className="coming-soon-subcopy">My new website is under construction. Follow me on social media for updates!</p>
          <div className="coming-soon-socials">
            {SOCIAL_LINKS.map(({ name, url, icon: Icon }) => (
              <a key={name} className="coming-soon-social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
                <Icon aria-hidden />
              </a>
            ))}
          </div>
        </section>

        <section className="schedule-panel">
          <h2 className="schedule-title">Weekly Schedule</h2>
          <div className="schedule-grid">
            {scheduleDayValues.map((day) => {
              const entry = entriesByDay.get(day);
              const date = formatDate(nextOccurrence(day));

              return (
                <div key={day} className={entry ? "schedule-day-card" : "schedule-day-card schedule-day-card--empty"}>
                  <div className="schedule-day-header">
                    <span className="schedule-day-abbr">{scheduleDayLabels[day]}</span>
                    <span className="schedule-day-meta">
                      <span>{date}</span>
                      {entry?.time ? <span>{entry.time}</span> : null}
                    </span>
                  </div>
                  {entry?.title ? (
                    <div className="schedule-day-body">
                      <p className="schedule-day-entry-title">{entry.title}</p>
                      <div className="schedule-day-thumb">
                        {entry.thumbnailUrl ? <img src={entry.thumbnailUrl} alt="" /> : null}
                      </div>
                      <span className="schedule-day-badge">{scheduleEntryTypeLabels[entry.type].toUpperCase()}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="paddock-card">
              <span className="paddock-card__label">Join the</span>
              {QR_CODE_URL ? (
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  <img className="paddock-qr" src={QR_CODE_URL} alt="Discord QR code" />
                </a>
              ) : null}
              <span className="paddock-card__title">Paddock</span>
              <div className="paddock-progress-wrap">
                <span className="paddock-progress-label">Next Remake</span>
                <div className="paddock-progress-track">
                  <div className="paddock-progress-fill" style={{ width: `${NEXT_REMAKE_PERCENT}%` }} />
                </div>
                <span className="paddock-progress-percent">{NEXT_REMAKE_PERCENT}%</span>
              </div>
            </div>
          </div>
        </section>

        <VideoSection title="Latest Videos" videos={latestVideos.data} isLoading={latestVideos.isLoading} error={latestVideos.isError} />
        <VideoSection title="Popular Videos" videos={popularVideos.data} isLoading={popularVideos.isLoading} error={popularVideos.isError} />
      </div>
    </div>
  );
}

function VideoSection({ title, videos, isLoading, error }: { title: string; videos?: YouTubeVideo[]; isLoading: boolean; error: boolean }) {
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

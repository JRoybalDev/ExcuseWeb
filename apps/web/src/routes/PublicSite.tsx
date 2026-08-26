import { scheduleDayLabels, scheduleEntryTypeLabels, type ScheduleDay } from "@fullstack-template/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FaDiscord, FaInstagram, FaTiktok, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/apiClient";
import { setDocumentTitle, setSiteFavicon, siteConfig } from "../shared/siteConfig";
import { VideoSection } from "../shared/VideoSection";

const CHANNEL_NAME = "ExcuseMeImJack";

const LOGO_URL = "/logo.png";
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

// The channel schedules in Pacific time; every displayed day/date/time is derived from the
// resulting absolute instant so it lands on the correct calendar day for each viewer.
const STREAM_TIMEZONE = "America/Los_Angeles";

const jsDayIndexToScheduleDay: ScheduleDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const scheduleDayToJsIndex: Record<ScheduleDay, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function zonedTimeToUtc(year: number, month: number, day: number, hours: number, minutes: number, timeZone: string): Date {
  const utcGuess = new Date(Date.UTC(year, month, day, hours, minutes));
  const tzDate = new Date(utcGuess.toLocaleString("en-US", { timeZone }));
  const utcDate = new Date(utcGuess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(utcGuess.getTime() - (tzDate.getTime() - utcDate.getTime()));
}

function getZonedDateParts(date: Date, timeZone: string): { year: number; month: number; day: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).formatToParts(date);
  const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  let year = 0;
  let month = 0;
  let day = 0;
  let weekday = 0;

  for (const part of parts) {
    if (part.type === "year") {
      year = Number(part.value);
    } else if (part.type === "month") {
      month = Number(part.value) - 1;
    } else if (part.type === "day") {
      day = Number(part.value);
    } else if (part.type === "weekday") {
      weekday = weekdayIndex[part.value] ?? 0;
    }
  }

  return { year, month, day, weekday };
}

// Finds the next absolute instant (this week, in Pacific-calendar terms) that a given
// day-of-week + wall-clock time occurs, so it can then be re-derived into any viewer's local day/time.
function nextOccurrenceInstant(day: ScheduleDay, time: string, now: Date): { instant: Date; hasTime: boolean } {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  const hasTime = match !== null;
  // Anchor day-less entries at Pacific noon so the local day rarely shifts for typical viewer offsets.
  const hours = match ? Number(match[1]) : 12;
  const minutes = match ? Number(match[2]) : 0;

  const pacificToday = getZonedDateParts(now, STREAM_TIMEZONE);
  const diff = (scheduleDayToJsIndex[day] - pacificToday.weekday + 7) % 7;
  const targetDateGuess = new Date(Date.UTC(pacificToday.year, pacificToday.month, pacificToday.day + diff));

  const instant = zonedTimeToUtc(
    targetDateGuess.getUTCFullYear(),
    targetDateGuess.getUTCMonth(),
    targetDateGuess.getUTCDate(),
    hours,
    minutes,
    STREAM_TIMEZONE
  );

  return { instant, hasTime };
}

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatLocalTime(instant: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(instant);
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

  const now = new Date();
  const scheduledEntries = (schedule.data ?? [])
    .map((entry) => ({ entry, ...nextOccurrenceInstant(entry.dayOfWeek, entry.time, now) }))
    .sort((a, b) => a.instant.getTime() - b.instant.getTime());
  const hasScheduleEntries = scheduledEntries.length > 0;

  return (
    <div className="coming-soon-page">
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
          <Link className="coming-soon-pitch-link" to="/build-requests">
            Pitch me a build <FiArrowRight aria-hidden />
          </Link>
        </section>

        <section className="schedule-panel">
          <h2 className="schedule-title">Weekly Schedule</h2>
          <div className="schedule-layout">
            <div className="schedule-grid">
              {hasScheduleEntries ? (
                scheduledEntries.map(({ entry, instant, hasTime }) => {
                  const localDay = jsDayIndexToScheduleDay[instant.getDay()]!;

                  return (
                    <div key={entry.id} className="schedule-day-card">
                      <div className="schedule-day-header">
                        <span className="schedule-day-abbr">{scheduleDayLabels[localDay]}</span>
                        <span className="schedule-day-meta">
                          <span>{formatDate(instant)}</span>
                          {hasTime ? <span>{formatLocalTime(instant)}</span> : null}
                        </span>
                      </div>
                      {entry.title ? (
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
                })
              ) : (
                <div className="schedule-empty-state">
                  <p>No items this week!</p>
                </div>
              )}
            </div>

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

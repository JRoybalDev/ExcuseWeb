import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaDiscord, FaInstagram, FaTiktok, FaTwitch, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiArrowUpRight, FiMessageSquare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/apiClient";
import { setDocumentTitle, setSiteFavicon } from "../shared/siteConfig";
import { VideoSection } from "../shared/VideoSection";

const CHANNEL_NAME = "ExcuseMeImJack";
const LOGO_URL = "/logo.png";
const DISCORD_URL = "https://discord.gg/fKW2eCsqqR";

const SOCIAL_ICON_LINKS = [
  { name: "YouTube", url: "https://youtube.com/@ExcuseMeImJack", icon: FaYoutube },
  { name: "Twitch", url: "https://www.twitch.tv/excusemeimjack", icon: FaTwitch },
  { name: "TikTok", url: "https://www.tiktok.com/@excusemeimjack", icon: FaTiktok },
  { name: "X", url: "https://x.com/excusemeimjack", icon: FaTwitter },
  { name: "Instagram", url: "https://www.instagram.com/excusemeimjack", icon: FaInstagram }
];

const PRIMARY_LINKS = [
  {
    label: "Watch on YouTube",
    caption: "New uploads every week!",
    url: "https://youtube.com/@ExcuseMeImJack",
    icon: FaYoutube,
    external: true
  },
  {
    label: "Watch Live on Twitch",
    caption: "Catch the process of all the builds!",
    url: "https://www.twitch.tv/excusemeimjack",
    icon: FaTwitch,
    external: true
  },
  {
    label: "Pitch Me a Build",
    caption: "Got an idea? Send it in!",
    url: "/build-requests",
    icon: FiMessageSquare,
    external: false
  }
];

export function Share() {
  useEffect(() => {
    setDocumentTitle("Links");
    setSiteFavicon();
  }, []);

  const latestVideos = useQuery({
    queryKey: ["youtube", "latest"],
    queryFn: () => apiClient.youtube.latest()
  });

  const popularVideos = useQuery({
    queryKey: ["youtube", "popular"],
    queryFn: () => apiClient.youtube.popular()
  });

  return (
    <div className="coming-soon-page share-page">
      <div className="coming-soon-content share-content">
        <section className="coming-soon-hero share-hero">
          <img className="share-avatar" src={LOGO_URL} alt={CHANNEL_NAME} />
          <h1 className="share-name">{CHANNEL_NAME}</h1>
          <p className="share-tagline">Check everything out — videos, streams, and the community.</p>
          <div className="coming-soon-socials share-hero-socials">
            {SOCIAL_ICON_LINKS.map(({ name, url, icon: Icon }) => (
              <a key={name} className="coming-soon-social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
                <Icon aria-hidden />
              </a>
            ))}
          </div>
        </section>

        <div className="share-links">
          {PRIMARY_LINKS.map(({ label, caption, url, icon: Icon, external }) =>
            external ? (
              <a key={label} className="share-link" href={url} target="_blank" rel="noopener noreferrer">
                <span className="share-link__icon">
                  <Icon aria-hidden />
                </span>
                <span className="share-link__text">
                  <span className="share-link__label">{label}</span>
                  <span className="share-link__caption">{caption}</span>
                </span>
                <FiArrowUpRight className="share-link__arrow" aria-hidden />
              </a>
            ) : (
              <Link key={label} className="share-link" to={url}>
                <span className="share-link__icon">
                  <Icon aria-hidden />
                </span>
                <span className="share-link__text">
                  <span className="share-link__label">{label}</span>
                  <span className="share-link__caption">{caption}</span>
                </span>
                <FiArrowUpRight className="share-link__arrow" aria-hidden />
              </Link>
            )
          )}
        </div>

        <section className="share-discord-card">
          <div className="share-discord-info">
            <span className="share-discord-eyebrow">Join the Paddock</span>
            <h2 className="share-discord-title">The Discord Community</h2>
            <p className="share-discord-caption">Hang out, chat about builds, and get notified the moment something new drops.</p>
            <a className="share-discord-cta" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              <FaDiscord aria-hidden /> Join the server
            </a>
          </div>
        </section>

        <VideoSection
          title="Latest Videos"
          videos={latestVideos.data?.slice(0, 4)}
          isLoading={latestVideos.isLoading}
          error={latestVideos.isError}
        />
        <VideoSection
          title="Popular Videos"
          videos={popularVideos.data?.slice(0, 4)}
          isLoading={popularVideos.isLoading}
          error={popularVideos.isError}
        />

        <p className="share-footer">{CHANNEL_NAME} &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default Share;

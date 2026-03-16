"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaYoutube, FaTwitch, FaTiktok, FaTwitter, FaInstagram, FaDiscord } from "react-icons/fa";
import WeeklySchedule from "@/components/WeeklySchedule";

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
};

const getProxiedUrl = (url: string) => {
  if (url.includes("arcon-api.duckdns.org")) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function HomePage() {
  const logoUrl = getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/ChannelArt/newpp_circle_transparent.png");
  const backgroundUrl = getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/Backgrounds/20251207111736_1.jpg");
  const discordUrl = "https://discord.gg/fKW2eCsqqR";
  const qrCodeUrl = getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/WeeklySchedule/discordqr.png");

  const socialLinks = [
    { name: "YouTube", url: "https://youtube.com/@ExcuseMeImJack", icon: <FaYoutube className="h-6 w-6" /> },
    { name: "Twitch", url: "https://www.twitch.tv/excusemeimjack", icon: <FaTwitch className="h-6 w-6" /> },
    { name: "TikTok", url: "https://www.tiktok.com/@excusemeimjack", icon: <FaTiktok className="h-6 w-6" /> },
    { name: "X", url: "https://x.com/excusemeimjack", icon: <FaTwitter className="h-6 w-6" /> },
    { name: "Instagram", url: "https://www.instagram.com/excusemeimjack", icon: <FaInstagram className="h-6 w-6" /> },
    { name: "Discord", url: discordUrl, icon: <FaDiscord className="h-6 w-6" /> },
  ];

  // == SCHEDULE DATA: edit these entries ==
  const scheduleEntries = [
    {
      day: "MON",
      date: "03/16",
      time: "",
      type: "NONE",
      title: "Custom Challenge Mode #3",
      thumbnailUrl: getProxiedUrl("https://placehold.co/400x225/2a1a10/c47a45?text=Stream"),
    },
    {
      day: "WED",
      date: "03/18",
      time: "12PM PDT",
      type: "YOUTUBE VIDEO",
      title: "Nusa Tenggara Outbreak Challenge",
      thumbnailUrl: getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/Backgrounds/challengemode1.jpg"),
    },
    {
      day: "FRI",
      date: "03/20",
      time: "12PM PDT",
      type: "TWITCH STREAM",
      title: "DIN Sanctuary Stream",
      thumbnailUrl: getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/Backgrounds/20260309122731_1.jpg"),
    },
    {
      day: "SAT",
      date: "03/21",
      time: "12PM PDT",
      type: "YOUTUBE STREAM",
      title: "Jurassic Park: Japan Stream",
      thumbnailUrl: getProxiedUrl("https://arcon-api.duckdns.org:7777/content/ExcuseMeImJack/Backgrounds/20251207111736_1.jpg"),
    },
  ];
  // ========================================

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/youtube");
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute -top-125 bottom-0 left-0 right-0 md:top-0">
        <Image
          src={backgroundUrl}
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="z-0 blur-xs scale-110"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-white">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src={logoUrl}
              alt="Logo"
              width={200}
              height={200}
              className="mx-auto rounded-full shadow-lg"
              unoptimized
            />
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            Coming Soon
          </h1>
          <p
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-md mx-auto"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}
          >
            My new website is under construction. Follow me on social media for updates!
          </p>

          {/* Social */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-12">
            {socialLinks.map((social) => (
              <Link href={social.url} key={social.name} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20">
                  {social.icon}
                </div>
              </Link>
            ))}
          </div>

          {/* Schedule */}
          <div className="mb-12">
            <WeeklySchedule
              entries={scheduleEntries}
              nextRemakePercent={0}
              discordUrl={discordUrl}
              qrCodeUrl={qrCodeUrl}
            />
          </div>

          {/* Latest Videos */}
          <div className="mb-12">
            <h2
              className="text-3xl font-bold mb-6"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              Latest Videos
            </h2>
            {isLoading && <p>Loading videos...</p>}
            {error && <p className="text-red-400">Error: {error}</p>}
            {!isLoading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {videos.map((video) => (
                  <Link href={video.url} key={video.id} target="_blank" rel="noopener noreferrer">
                    <div className="bg-white/10 rounded-lg overflow-hidden backdrop-blur-sm border border-[#FFCDB4] h-full flex flex-col group transition-all duration-300 hover:scale-105 hover:border-white/30">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          layout="fill"
                          objectFit="cover"
                          className="group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs sm:text-sm font-semibold truncate text-left" title={video.title}>
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!isLoading && !error && videos.length === 0 && (
              <p>No videos found. Check your YouTube API configuration.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

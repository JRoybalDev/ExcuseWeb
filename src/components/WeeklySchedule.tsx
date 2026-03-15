"use client";

import Image from "next/image";

type ScheduleEntry = {
  day: string;
  date: string;
  time: string;
  type?: "TWITCH STREAM" | "YOUTUBE VIDEO" | "YOUTUBE STREAM" | "STREAM" | "NONE" | string;
  title?: string;
  thumbnailUrl?: string;
};

type WeeklyScheduleProps = {
  entries: ScheduleEntry[];
  nextRemakePercent?: number;
  discordUrl?: string;
  qrCodeUrl?: string;
};

export default function WeeklySchedule({
  entries,
  nextRemakePercent = 0,
  discordUrl,
  qrCodeUrl,
}: WeeklyScheduleProps) {
  return (
    <div
      className="w-full rounded-2xl p-5 backdrop-blur-md border"
      style={{
        background: "rgba(26, 14, 9, 0.55)",
        borderColor: "#FFCDB4",
        boxShadow: "0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Title */}
      <h2
        className="text-4xl md:text-5xl font-futura font-bold text-center mb-6 tracking-widest uppercase"
        style={{
          color: "#6b3a2a",
          WebkitTextStroke: "1px #FFCDB4",
          textShadow: "2px 2px 0px #3d1f14, 0 4px 12px rgba(0,0,0,0.6)",
          letterSpacing: "0.12em",
        }}
      >
        Weekly Schedule
      </h2>

      {/* ── DESKTOP: horizontal card row ── */}
      <div className="hidden md:flex gap-3 w-full">
        {entries.map((entry, i) => {
          if (entry.type === "NONE") {
            return (
              <div key={i} className="flex-1 min-w-0 flex flex-col rounded-2xl border min-h-75" style={{ background: "#1a0e09", borderColor: "#3d1f14" }}>
                {/* Header */}
                <div className="p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-futura font-bold text-2xl uppercase" style={{ color: "#e8d5c4" }}>
                      {entry.day}
                    </span>
                    <div className="flex flex-col items-end leading-none text-right">
                      <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
                        {entry.date}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
                        {entry.time}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div className="px-3">
                  <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                </div>
                {/* Blank growing space */}
                <div className="grow" />
              </div>
            );
          }
          return <DesktopCard key={i} entry={entry} />;
        })}

        {/* Join the Paddock card */}
        <div
          className="flex flex-col items-center justify-between rounded-2xl p-3 min-w-32.5 shrink-0 border-2 border-dashed"
          style={{
            background: "#1a0e09",
            borderColor: "#6b3a2a",
          }}
        >
          <div className="flex flex-col items-center justify-between p-3 min-w-32.5 shrink-0">
            <p
              className="text-center font-futura font-bold text-lg leading-tight uppercase tracking-wider"
              style={{ color: "#e8d5c4" }}
            >
              Join the
            </p>
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                onClick={() => discordUrl && window.open(discordUrl, "_blank")}
                alt="QR Code"
                width={90}
                height={90}
                className="rounded-md my-2"
                unoptimized
              />
            ) : (
              <div
                className="w-22.5 h-22.5 my-2 rounded-md flex items-center justify-center text-xs text-center"
                style={{ background: "#2a1a10", color: "#8a6a5a" }}
              >
                QR Code
              </div>
            )}
            <p
              className="text-center font-futura font-bold text-xl uppercase tracking-widest"
              style={{ color: "#e8d5c4" }}
            >
              Paddock
            </p>
          </div>

          <div className="w-full mt-3">
            <p
              className="text-center text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#e8d5c4" }}
            >
              Next Remake
            </p>
            <div
              className="w-full rounded-full h-4 overflow-hidden border"
              style={{ background: "#0d0705", borderColor: "#3d1f14" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${nextRemakePercent}%`,
                  background: "linear-gradient(90deg, #6b3a2a, #c47a45)",
                }}
              />
            </div>
            <p
              className="text-center text-xs mt-1 font-bold"
              style={{ color: "#c47a45" }}
            >
              {nextRemakePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* ── MOBILE: vertical list ── */}
      <div className="flex md:hidden flex-col gap-3 w-full">
        {entries.map((entry, i) => {
          if (entry.type === "NONE") {
            return (
              <div key={i} className="flex h-24 rounded-2xl overflow-hidden border" style={{ background: "#1a0e09", borderColor: "#3d1f14" }}>
                <div className="flex flex-col justify-center px-4 py-3 min-w-22.5" style={{ borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}>
                  <span className="font-futura font-bold text-2xl uppercase leading-none" style={{ color: "#e8d5c4" }}>
                    {entry.day}
                  </span>
                  <span className="text-xs font-bold mt-1" style={{ color: "#c47a45" }}>
                    {entry.date}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
                    {entry.time}
                  </span>
                </div>
                <div className="grow" />
              </div>
            );
          }
          return <MobileCard key={i} entry={entry} />;
        })}
      </div>
    </div>
  );
}

/* ── Desktop card ── */
function DesktopCard({ entry }: { entry: ScheduleEntry }) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col rounded-2xl overflow-hidden border min-h-75"
      style={{ background: "#1a0e09", borderColor: "#3d1f14" }}
    >
      {/* Header */}
      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-futura font-bold text-2xl uppercase"
            style={{ color: "#e8d5c4" }}
          >
            {entry.day}
          </span>
          <div className="flex flex-col items-end leading-none text-right">
            <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
              {entry.date}
            </span>
            <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
              {entry.time}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-3">
        <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
      </div>

      <div className="grow flex flex-col">
        <div className="grow flex items-center justify-center p-3">
          {entry.title && (
            <p className="font-futura font-bold text-sm uppercase leading-tight tracking-wide text-center" style={{ color: "#e8d5c4" }}>
              {entry.title}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {entry.thumbnailUrl ? (
            <Image
              src={entry.thumbnailUrl}
              alt={entry.title ?? ""}
              layout="fill"
              objectFit="cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "#0d0705" }} />
          )}
          {/* Type badge */}
          {entry.type && (
            <div
              className="absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-bold uppercase tracking-widest"
              style={{ background: "rgba(26,14,9,0.85)", color: "#c47a45" }}
            >
              {entry.type}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile card ── */
function MobileCard({ entry }: { entry: ScheduleEntry }) {
  return (
    <div
      className="flex rounded-2xl overflow-hidden border"
      style={{ background: "#1a0e09", borderColor: "#3d1f14" }}
    >
      {/* Left: day info */}
      <div
        className="flex flex-col justify-center px-4 py-3 min-w-22.5"
        style={{ borderRight: "1px solid rgba(255, 255, 255, 0.2)" }}
      >
        <span
          className="font-futura font-bold text-2xl uppercase leading-none"
          style={{ color: "#e8d5c4" }}
        >
          {entry.day}
        </span>
        <span className="text-xs font-bold mt-1" style={{ color: "#c47a45" }}>
          {entry.date}
        </span>
        <span className="text-xs font-bold" style={{ color: "#c47a45" }}>
          {entry.time}
        </span>
      </div>

      {/* Middle: content */}
      <div className="flex flex-col justify-center px-3 py-3 flex-1 min-w-0">
        {entry.type && (
          <span
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: "#c47a45" }}
          >
            {entry.type}
          </span>
        )}
        {entry.title && (
          <p
            className="font-futura font-bold text-base uppercase leading-tight tracking-wide"
            style={{ color: "#e8d5c4" }}
          >
            {entry.title}
          </p>
        )}
      </div>

      {/* Right: thumbnail */}
      {entry.thumbnailUrl && (
        <div className="relative w-28 shrink-0">
          <Image
            src={entry.thumbnailUrl}
            alt={entry.title ?? ""}
            layout="fill"
            objectFit="cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

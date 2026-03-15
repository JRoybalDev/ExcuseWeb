import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "ExcuseMeImJack | Home",
  description: "Hey-yyy what's up guys! Welcome to the official ExcuseMeImJack website! Currently we are under construction but we'll be up and running real soon! Don't worry, no escaped assets here... *I think*",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "ExcuseMeImJack | Home",
    description: "Hey-yyy what's up guys! Welcome to the official ExcuseMeImJack website! Currently we are under construction but we'll be up and running real soon! Don't worry, no escaped assets here... *I think*",
    url: BASE_URL,
    siteName: "ExcuseMeImJack Official Website",
    images: [
      {
        url: "/api/og-image",
        width: 1200,
        height: 630,
        alt: "ExcuseMeImJack",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExcuseMeImJack | Home",
    description: "Hey-yyy what's up guys! Welcome to the official ExcuseMeImJack website! Currently we are under construction but we'll be up and running real soon! Don't worry, no escaped assets here... *I think*",
    images: ["/api/og-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

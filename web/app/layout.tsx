import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suno AI Music Studio — Powered by ACE-Step 1.5",
  description:
    "Futuristic open source AI music generator powered by ACE-Step 1.5. Generate high quality songs, beats, and instruments directly in your browser.",
  keywords: ["AI Music", "Suno", "ACE-Step 1.5", "Music Generator", "Text to Music", "Open Source AI"],
  authors: [{ name: "ACE-Step Community" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-gradient text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}

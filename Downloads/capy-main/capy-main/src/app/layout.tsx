import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Capy",
  description:
    "Meet your AI accountability capybara. Upload your assignment, race the timer, prove you did the work. Your pet earns XP when you deliver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full">
      <body
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} min-h-full flex flex-col antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

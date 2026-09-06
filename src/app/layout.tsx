import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Capy",
  description:
    "Meet your AI accountability capybara. Tell Capy what you're stuck on, agree on one small first step, and show your work. Your pet earns XP when your first step checks out.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} min-h-full flex flex-col antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

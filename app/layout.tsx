import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";

// Load global interactive components client-side only
const AiChatbot = dynamic(() => import("@/components/ai/AiChatbot"), { ssr: false });
const AchievementToast = dynamic(() => import("@/components/gamification/AchievementToast"), { ssr: false });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "System Design by Anish — AI-Powered Learning Platform",
  description: "Master distributed systems with interactive 3D visualizations, AI-powered explanations, and FAANG mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
            {children}
            <Footer />
          </main>
        </div>
        {/* Global overlays — appear on every page */}
        <AiChatbot />
        <AchievementToast />
      </body>
    </html>
  );
}

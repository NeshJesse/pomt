import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { NO_FLASH_THEME_SCRIPT } from "@/lib/theme";
import { ThemeProvider } from "@/components/ThemeProvider";
import StorageWarningBanner from "@/components/StorageWarningBanner";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-display",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-num",
});

export const metadata: Metadata = {
  title: "Piece of My Time",
  description: "Give a piece of your time to the things that matter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Sets data-theme on <html> before hydration so there's no flash of
            the wrong theme on load. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <StorageWarningBanner />
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 pb-24 md:pb-8">{children}</main>
              <MobileNav />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorker } from "@/components/ServiceWorker";
import { APP_NAME, TAGLINE } from "@/lib/brand";
import { getSessionUid } from "@/lib/session";
import "./globals.css";

const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const heading = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${APP_NAME} - ${TAGLINE}`, template: `%s | ${APP_NAME}` },
  description: "Track your PUBG Mobile matches, see your progress and share your player card.",
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f1210",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const uid = await getSessionUid();
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body>
        <main className="mx-auto w-full max-w-xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(7rem+var(--badge-space,0px))]">
          {children}
        </main>
        <BottomNav uid={uid} />
        <ServiceWorker />
      </body>
    </html>
  );
}

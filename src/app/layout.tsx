import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const defaultSiteUrl = "https://seolbi-learning-platform.pages.dev";
const defaultAdsenseClientId = "ca-pub-5167419072810145";
const adsenseClientId = /^ca-pub-\d{16}$/.test(
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? defaultAdsenseClientId,
)
  ? (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? defaultAdsenseClientId)
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || defaultSiteUrl),
  title: { default: "설비보전기사 마스터북", template: "%s | 설비보전기사 마스터북" },
  description: "설비보전기사 이론, 랜덤 문제, 오답 이해와 반복 학습을 한 흐름으로 연결합니다.",
  alternates: { canonical: "/" },
  other: adsenseClientId ? { "google-adsense-account": adsenseClientId } : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        {adsenseClientId ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        ) : null}
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bigdata-masterbook.wanran2.chatgpt.site"),
  title: {
    default: "빅데이터분석기사 통합 개념서",
    template: "%s | 빅데이터분석기사 통합 개념서",
  },
  description:
    "이론·개념지도·문제은행·실기 Python 코드를 한 흐름으로 학습하는 빅데이터분석기사 통합 개념서입니다.",
  openGraph: {
    title: "빅데이터분석기사 통합 개념서",
    description: "이론 · 개념지도 · 문제은행 · 실기 코드",
    type: "website",
    images: [{ url: "/og.png", alt: "빅데이터분석기사 통합 개념서" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "빅데이터분석기사 통합 개념서",
    description: "이론 · 개념지도 · 문제은행 · 실기 코드",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

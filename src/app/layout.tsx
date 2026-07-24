import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "빅데이터분석기사 마스터북",
    template: "%s | 빅데이터분석기사 마스터북",
  },
  description:
    "빅데이터분석기사 필기 개념부터 문제 풀이, 실기 Python 코드까지 한 흐름으로 학습합니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

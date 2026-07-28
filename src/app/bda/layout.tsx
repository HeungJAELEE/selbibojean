import type { Metadata } from "next";
import { BdaSectionNav } from "@/components/bda-section-nav";

export const metadata: Metadata = {
  title: {
    default: "빅데이터분석기사 학습실",
    template: "%s | 빅데이터분석기사 학습실",
  },
  description:
    "통합 이론, 문제은행, 실기 유형 1·2·3 Python 코드를 연결한 빅데이터분석기사 학습 플랫폼입니다.",
};

export default function BdaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <BdaSectionNav />
      {children}
    </>
  );
}

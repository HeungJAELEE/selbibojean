import type { Metadata } from "next";
import { BdaSectionNav } from "@/components/bda-section-nav";

export const metadata: Metadata = {
  title: {
    default: "빅데이터분석기사 학습실",
    template: "%s | 빅데이터분석기사 학습실",
  },
  description:
    "사용자 제공 이론을 바탕으로 구성한 빅데이터분석기사 필기 학습 베타입니다.",
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

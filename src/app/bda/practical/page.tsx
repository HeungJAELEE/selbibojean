import type { Metadata } from "next";
import { BdaPracticalHub } from "@/components/bda-practical-hub";
import { getBdaCourseLibrary } from "@/lib/content/bda-course-library-repository";
import { getBdaQbank } from "@/lib/content/bda-qbank-repository";
import { isBdaPracticalTab } from "@/lib/domain/bda-course-curriculum";

export const metadata: Metadata = {
  title: "실기 코딩 총정리",
  description:
    "빅데이터분석기사 유형 1·2·3, Python 코드, 제출 검수와 원본 교육자료를 시험 흐름에 맞춰 학습합니다.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BdaPracticalPage({ searchParams }: Props) {
  const params = await searchParams;
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const activeTab = isBdaPracticalTab(requestedTab)
    ? requestedTab
    : "overview";
  const library = getBdaCourseLibrary();
  const qbank = getBdaQbank();

  const conceptNames = Object.fromEntries(
    qbank.concepts.map((concept) => [concept.id, concept.name ?? concept.id]),
  );

  return (
    <BdaPracticalHub
      activeTab={activeTab}
      library={library}
      practicalTaskCount={qbank.stats.practicalTaskCount}
      conceptNames={conceptNames}
    />
  );
}

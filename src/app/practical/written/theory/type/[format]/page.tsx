import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { PracticalWrittenCardLink } from "@/components/practical-written-card-link";
import { PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS } from "@/data/source/practical-written-exam-cards";
import { getPracticalWrittenExamCardsByFormat } from "@/lib/content/practical-repository";
import type { PracticalWrittenExamCardFormat } from "@/lib/domain/practical-types";

const validFormats = new Set<PracticalWrittenExamCardFormat>([
  "image",
  "definition",
  "calculation",
  "sequence",
  "drawing",
  "symbol",
  "matching",
  "diagnosis",
]);

const guides: Record<PracticalWrittenExamCardFormat, string[]> = {
  image: ["형상·배치·하중방향을 표시합니다.", "사진 순서와 답안 순서를 맞춥니다.", "명칭 뒤에 판별 특징을 한 줄 덧붙입니다."],
  definition: ["무엇인지 먼저 씁니다.", "성립조건과 나타나는 현상을 붙입니다.", "비슷한 용어와 다른 점을 확인합니다."],
  calculation: ["주어진 값과 단위를 정리합니다.", "공식과 유효면적을 먼저 씁니다.", "계산과정·최종값·단위를 모두 남깁니다."],
  sequence: ["안전·준비 조건을 맨 앞에 둡니다.", "선행조건이 필요한 단계를 찾습니다.", "완료 확인과 복구를 마지막에 둡니다."],
  drawing: ["기준면·지시선·투상방향을 찾습니다.", "기호가 가리키는 정확한 위치를 봅니다.", "원도면이 없으면 복원문제로 공개하지 않습니다."],
  symbol: ["모양과 색을 함께 봅니다.", "기호명뿐 아니라 요구 행동을 씁니다.", "현행 표준 근거를 확인합니다."],
  matching: ["각 항목의 고유 특징을 하나씩 찾습니다.", "남은 선택지를 소거합니다.", "명칭과 용도를 같은 순서로 씁니다."],
  diagnosis: ["증상과 원인을 분리합니다.", "확인 순서를 앞단부터 씁니다.", "조치 후 재시험·재확인을 포함합니다."],
};

export default async function PracticalWrittenTypePage({
  params,
}: {
  params: Promise<{ format: string }>;
}) {
  const { format: rawFormat } = await params;
  if (!validFormats.has(rawFormat as PracticalWrittenExamCardFormat)) notFound();
  const format = rawFormat as PracticalWrittenExamCardFormat;
  const cards = await getPracticalWrittenExamCardsByFormat(format);

  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="실기 필답형 · 기출 유형별 학습"
        title={PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS[format]}
        description="풀이 순서를 확인한 뒤 검증된 기출을 답 가리고 작성하고, 제출 후 변형·예상문제로 확장합니다."
      />
      <nav className="mt-5 flex flex-wrap gap-2 text-sm font-extrabold">
        <Link href="/practical/written/theory?view=exam-type" className="rounded-lg border border-slate-200 px-4 py-2 text-[#16697a]">
          8유형 목차
        </Link>
        <Link href="/practical/written/past" className="rounded-lg border border-slate-200 px-4 py-2 text-[#16697a]">
          기출복원
        </Link>
        <Link href="/practical/written/predicted" className="rounded-lg border border-slate-200 px-4 py-2 text-[#16697a]">
          변형·예상
        </Link>
      </nav>

      <section className="mt-8 rounded-3xl bg-[#173957] p-6 text-white md:p-8">
        <p className="text-xs font-black uppercase tracking-[.14em] text-teal-200">
          풀이 루틴
        </p>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {guides[format].map((guide, index) => (
            <li key={guide} className="rounded-2xl bg-white/10 p-4 text-sm leading-6">
              <strong className="mr-2 text-teal-200">{index + 1}</strong>
              {guide}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold">이 유형의 풀이카드</h2>
          <span className="text-sm font-bold text-slate-500">{cards.length}개</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <PracticalWrittenCardLink key={card.id} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}

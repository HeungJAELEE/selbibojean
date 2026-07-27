import Link from "next/link";
import {
  Calculator,
  Camera,
  FileQuestion,
  GitCompareArrows,
  ListOrdered,
  ScanSearch,
  Shapes,
  Siren,
} from "lucide-react";
import { PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS } from "@/data/source/practical-written-exam-cards";
import type {
  PracticalWrittenExamCard,
  PracticalWrittenExamCardFormat,
} from "@/lib/domain/practical-types";

const formatMeta: Array<{
  id: PracticalWrittenExamCardFormat;
  icon: typeof Camera;
  guide: string;
}> = [
  { id: "image", icon: Camera, guide: "형상·배치·하중방향을 찾아 명칭을 씁니다." },
  { id: "definition", icon: FileQuestion, guide: "정의·성립조건·현상을 한 문장으로 씁니다." },
  { id: "calculation", icon: Calculator, guide: "공식 선택부터 단위와 최종값까지 적습니다." },
  { id: "sequence", icon: ListOrdered, guide: "안전·준비·작업·확인의 선후관계를 배열합니다." },
  { id: "drawing", icon: ScanSearch, guide: "도면의 지시선·투상·공차 위치를 읽습니다." },
  { id: "symbol", icon: Shapes, guide: "기호의 이름과 요구 행동을 함께 연결합니다." },
  { id: "matching", icon: GitCompareArrows, guide: "부품·특징·용도를 정확히 짝짓습니다." },
  { id: "diagnosis", icon: Siren, guide: "현상에서 원인·점검·조치·재확인으로 풉니다." },
];

export function PracticalWrittenExamTypeIndex({
  cards,
}: {
  cards: PracticalWrittenExamCard[];
}) {
  return (
    <section className="mt-10" aria-labelledby="exam-type-index-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">8개 고정 출제유형</p>
          <h2 id="exam-type-index-title" className="mt-2 text-2xl font-extrabold">
            유형을 고르고 실제 기출부터 풉니다
          </h2>
        </div>
        <p className="text-sm font-bold text-slate-500">
          풀이카드 {cards.length}개
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {formatMeta.map(({ id, icon: Icon, guide }) => {
          const formatCards = cards.filter(
            (card) =>
              card.primaryFormat === id || card.secondaryFormats.includes(id),
          );
          return (
            <Link
              key={id}
              href={`/practical/written/theory/type/${id}`}
              className="card group p-5 transition hover:-translate-y-0.5 hover:border-[#16697a]"
              data-testid={`practical-written-format-${id}`}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">
                {PRACTICAL_WRITTEN_EXAM_FORMAT_LABELS[id]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{guide}</p>
              <p className="mt-4 text-xs font-extrabold text-[#16697a]">
                카드 {formatCards.length}개 · 직접 풀기 →
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

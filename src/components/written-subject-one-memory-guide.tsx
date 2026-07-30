import { WrittenSubjectMemoryGuide } from "@/components/written-subject-memory-guide";
import { WRITTEN_SUBJECT_ONE_MEMORY_GUIDE } from "@/data/source/written-subject-one-memory-guide";
import type { PublicQuestion } from "@/lib/domain/types";

type LessonLink = {
  id: string;
  title: string;
  conceptGroupId?: string;
};

const SUBJECT_ONE_PARTS = [
  { id: "fluid-foundation", label: "공유압 기초" },
  { id: "fluid-equipment", label: "공유압 기기·회로" },
  { id: "electric-electronic", label: "전기·전자" },
  { id: "plc-automatic-control", label: "PLC·자동제어" },
] as const;

export function WrittenSubjectOneMemoryGuide({
  lessons,
  questions,
}: {
  lessons: LessonLink[];
  questions: PublicQuestion[];
}) {
  return (
    <WrittenSubjectMemoryGuide
      subjectCode={1}
      heading="공유압 및 자동제어를 23개 흐름으로 묶어보기"
      description="원문에서 다룬 공유압·전기·PLC 주제를 표 안 항목까지 소주제로 연결하고, NCS 용어와 검수된 상세 레슨으로 오류를 교정해 이해를 보충합니다."
      parts={SUBJECT_ONE_PARTS}
      bundles={WRITTEN_SUBJECT_ONE_MEMORY_GUIDE}
      lessons={lessons}
      questions={questions}
    />
  );
}

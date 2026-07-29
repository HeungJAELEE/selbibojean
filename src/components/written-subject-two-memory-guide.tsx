import { WrittenSubjectMemoryGuide } from "@/components/written-subject-memory-guide";
import {
  WRITTEN_SUBJECT_TWO_MEMORY_GUIDE,
  WRITTEN_SUBJECT_TWO_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-two-memory-guide";
import type { PublicQuestion } from "@/lib/domain/types";

type LessonLink = {
  id: string;
  title: string;
  conceptGroupId?: string;
};

const SUBJECT_TWO_PARTS = [
  { id: "welding-foundation", label: "용접 기초" },
  { id: "arc-special-welding", label: "아크·특수용접" },
  { id: "defect-inspection-joint", label: "결함·검사·이음" },
  { id: "industrial-safety", label: "산업안전" },
] as const;

export function WrittenSubjectTwoMemoryGuide({
  lessons,
  questions,
}: {
  lessons: LessonLink[];
  questions: PublicQuestion[];
}) {
  return (
    <WrittenSubjectMemoryGuide
      subjectCode={2}
      heading="용접 및 안전관리를 11개 흐름으로 묶어보기"
      description="용접·안전 기출 주제를 학습 흐름에 맞게 묶었습니다. NCS 용어와 검수 레슨은 열원·접합 원리·결함 정의가 충돌할 때 교정하고 이해를 보충하는 기준으로 사용합니다."
      parts={SUBJECT_TWO_PARTS}
      bundles={WRITTEN_SUBJECT_TWO_MEMORY_GUIDE}
      lessons={lessons}
      questions={questions}
      sourceBoundaryNote={WRITTEN_SUBJECT_TWO_SOURCE_BOUNDARY}
    />
  );
}

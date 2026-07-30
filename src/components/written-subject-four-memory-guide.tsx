import { WrittenSubjectMemoryGuide } from "@/components/written-subject-memory-guide";
import {
  WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE,
  WRITTEN_SUBJECT_FOUR_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-four-memory-guide";
import type { PublicQuestion } from "@/lib/domain/types";

type LessonLink = {
  id: string;
  title: string;
  conceptGroupId?: string;
};

const SUBJECT_FOUR_PARTS = [
  { id: "measurement-diagnosis", label: "계측·진단" },
  { id: "vibration-noise", label: "진동·소음" },
  { id: "maintenance-reliability", label: "보전·신뢰성" },
  { id: "planning-economics", label: "계획·경제성" },
  { id: "lubrication", label: "윤활관리" },
] as const;

export function WrittenSubjectFourMemoryGuide({
  lessons,
  questions,
}: {
  lessons: LessonLink[];
  questions: PublicQuestion[];
}) {
  return (
    <WrittenSubjectMemoryGuide
      subjectCode={4}
      heading="설비진단 및 관리를 24개 흐름으로 묶어보기"
      description="계측·진단·보전·TPM·윤활의 원문 주제를 본문·표·공식 중심으로 빠짐없이 엮었습니다. NCS 용어와 검수 레슨은 정의·분류·계산 조건을 교정하고, 장비별 절대 수치는 근거가 확인된 범위에서만 보충합니다."
      parts={SUBJECT_FOUR_PARTS}
      bundles={WRITTEN_SUBJECT_FOUR_MEMORY_GUIDE}
      lessons={lessons}
      questions={questions}
      sourceBoundaryNote={WRITTEN_SUBJECT_FOUR_SOURCE_BOUNDARY}
    />
  );
}

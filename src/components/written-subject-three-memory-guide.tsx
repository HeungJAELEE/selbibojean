import { WrittenSubjectMemoryGuide } from "@/components/written-subject-memory-guide";
import {
  WRITTEN_SUBJECT_THREE_MEMORY_GUIDE,
  WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY,
} from "@/data/source/written-subject-three-memory-guide";
import type { PublicQuestion } from "@/lib/domain/types";

type LessonLink = {
  id: string;
  title: string;
  conceptGroupId?: string;
};

const SUBJECT_THREE_PARTS = [
  { id: "drawing-measurement", label: "도면·측정" },
  { id: "machining-materials", label: "가공·재료" },
  { id: "assembly-elements", label: "조립·기계요소" },
  { id: "piping-fluid-machinery", label: "배관·유체기계" },
  { id: "drive-maintenance", label: "구동설비 보전" },
] as const;

export function WrittenSubjectThreeMemoryGuide({
  lessons,
  questions,
}: {
  lessons: LessonLink[];
  questions: PublicQuestion[];
}) {
  return (
    <WrittenSubjectMemoryGuide
      subjectCode={3}
      heading="기계설비 일반을 13개 흐름으로 묶어보기"
      description="도면·측정·기계요소·유체기계 기출 주제를 학습 흐름에 맞게 엮었습니다. NCS와 상세 레슨은 부품명·작동원리·고장 원인을 정확히 교정하고 보충하는 층으로 연결합니다."
      parts={SUBJECT_THREE_PARTS}
      bundles={WRITTEN_SUBJECT_THREE_MEMORY_GUIDE}
      lessons={lessons}
      questions={questions}
      sourceBoundaryNote={WRITTEN_SUBJECT_THREE_SOURCE_BOUNDARY}
    />
  );
}

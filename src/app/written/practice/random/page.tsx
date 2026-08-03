import { Suspense } from "react";
import { PageHeading } from "@/components/page-heading";
import { RandomPractice } from "@/components/random-practice";
import { getContent } from "@/lib/content/repository";
import { isReleaseFeatureEnabled } from "@/lib/release-features";

export default async function RandomPracticePage() {
  const content = await getContent();
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="No duplicate session"
        title="랜덤 문제풀이"
        description="새 세션마다 선택 범위의 공개 문제를 무작위 순서로 출제합니다. 한 세션 안에서는 중복 출제하지 않으며 정답은 제출 전 응답에 포함하지 않습니다."
      />
      <Suspense fallback={<div className="card p-8">문제 설정을 불러오는 중…</div>}>
        <RandomPractice
          subjects={content.subjects}
          groups={content.conceptGroups}
          choiceShuffleEnabled={isReleaseFeatureEnabled(
            "mock_choice_shuffle",
          )}
        />
      </Suspense>
    </div>
  );
}

/**
 * 문제 문장과 별개로, 교재 목차와 개념 페이지에서 보여 줄 출제 형태다.
 * 실제 복원과 자체 예상문제를 같은 출제 이력처럼 보이게 하지 않기 위해
 * 정답·회차 정보는 이 파일에 넣지 않는다.
 */
export const PRACTICAL_QUESTION_FORMAT_LABELS: Record<string, string> = {
  "P-2026-1-Q07": "두 피스톤의 힘·면적 관계식 완성",
  "EXP-C05": "출력힘 계산(지름비·효율 조건)",
  "EXP-C06": "지름비에서 힘비·이동거리 비교",
  "EXP-C07": "유압 브레이크 적용과 압력 전달 설명",
  "EXP-C08": "원리 정의(밀폐 정지유체의 압력 전달)",
  "EXP-H04A": "축압기의 기능 3가지",
  "EXP-H04B": "축압기 분해 전 조치 2가지",
};

export function practicalQuestionFormatLabel(id: string, fallback: string) {
  return PRACTICAL_QUESTION_FORMAT_LABELS[id] ?? fallback;
}

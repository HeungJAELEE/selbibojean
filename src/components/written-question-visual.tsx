type WrittenQuestionVisualSpec = {
  altText: string;
  caption: string;
  sourceUrls: readonly string[];
};

export const WRITTEN_QUESTION_VISUALS: Readonly<
  Record<string, WrittenQuestionVisualSpec>
> = {
  "U-722": {
    altText:
      "원 안쪽을 향하는 속이 빈 삼각형과 양쪽 연결선을 포함한 유체동력 기호",
    caption:
      "원문 기호를 표준 도식 원리에 맞춰 자체 재작성한 학습용 도해",
    sourceUrls: [
      "https://cbtbank.kr/exam/de20180428",
      "https://cbtbank.kr/exam/de20150919",
      "https://cbtbank.kr/exam/de20111002",
      "https://www.festo.com/gb/en/e/blog/in-practice/create-circuit-diagrams-with-fluiddraw-id_1517386",
    ],
  },
};

export function WrittenQuestionVisual({ questionId }: { questionId: string }) {
  const spec = WRITTEN_QUESTION_VISUALS[questionId];
  if (!spec) return null;

  return (
    <figure
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
      data-testid={`written-question-visual-${questionId}`}
    >
      <svg
        viewBox="0 0 200 120"
        role="img"
        aria-label={spec.altText}
        className="mx-auto h-auto w-full max-w-sm text-slate-950"
      >
        <title>{spec.altText}</title>
        <line
          x1="18"
          y1="60"
          x2="61"
          y2="60"
          stroke="currentColor"
          strokeWidth="4"
        />
        <circle
          cx="100"
          cy="60"
          r="39"
          fill="white"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M74 45 L102 60 L74 75 Z"
          fill="white"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <line
          x1="139"
          y1="60"
          x2="182"
          y2="60"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
      <figcaption className="mt-3 text-center text-xs font-semibold leading-5 text-slate-500">
        {spec.caption}
      </figcaption>
    </figure>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  FileCode2,
  Layers3,
  LockKeyhole,
  SearchCheck,
  Table2,
} from "lucide-react";
import {
  BdaCourseLibraryBrowser,
  type PublicBdaCourseResource,
} from "@/components/bda-course-library-browser";
import { BdaPracticalTabs } from "@/components/bda-practical-tabs";
import { bdaCourseCurriculum } from "@/data/source/bda-course-curriculum";
import { bdaExamBlueprint } from "@/data/source/bda-exam-blueprint";
import { bdaCodeLabs } from "@/data/source/bda-practical-content";
import {
  selectCourseResources,
  type BdaCourseModule,
  type BdaPracticalTab,
} from "@/lib/domain/bda-course-curriculum";
import type {
  BdaCourseLibrary,
  BdaCourseLibraryItem,
} from "@/lib/domain/bda-course-library";

const tabIntroductions: Record<
  BdaPracticalTab,
  { eyebrow: string; title: string; description: string; checks: string[] }
> = {
  overview: {
    eyebrow: "실기 풀이 기준",
    title: "실기는 코드 암기보다 판단 순서를 고정하는 시험입니다.",
    description:
      "공식 체험환경의 유형 1·2·3과 제출 규칙을 기준으로 문제를 입력·처리·검증·출력의 네 구간으로 나눕니다.",
    checks: [
      "유형 1: 데이터 처리 결과를 수치 또는 표로 계산",
      "유형 2: 분류·회귀 모델을 만들고 예측 파일 제출",
      "유형 3: 통계 검정의 통계량·p값·결론 작성",
      "모든 유형: 누수·개인정보·출력 형식 재검산",
    ],
  },
  foundations: {
    eyebrow: "선수 지식",
    title: "Python과 pandas는 시험 풀이에 필요한 만큼만 익힙니다.",
    description:
      "자료형·조건·함수와 DataFrame 선택·품질 확인을 먼저 익혀 유형별 코드에서 문법 때문에 멈추지 않도록 합니다.",
    checks: [
      "리스트·딕셔너리·문자열 인덱싱",
      "DataFrame·Series와 loc·iloc 결과 형태",
      "자료형·결측·중복·기술통계 확인",
      "패키지 설치 없이 제공 환경만 사용",
    ],
  },
  type1: {
    eyebrow: "유형 1",
    title: "데이터 구조를 확인한 뒤 변환하고 집계합니다.",
    description:
      "shape, 열 이름, 자료형, 결측부터 확인한 뒤 필터·파생변수·groupby·merge·피벗을 적용합니다.",
    checks: [
      "원본 행 수와 변환 후 행 수를 함께 기록",
      "결측·이상값을 문항 근거 없이 자동 삭제하지 않기",
      "날짜·문자열 파싱 실패값을 별도 확인",
      "동률 정렬과 반올림 조건까지 출력에 반영",
    ],
  },
  type2: {
    eyebrow: "유형 2",
    title: "전처리와 모델을 한 파이프라인으로 검증합니다.",
    description:
      "목표 변수 유형과 평가 지표를 먼저 확인하고, 학습 데이터에서만 전처리기를 적합해 분류·회귀 예측을 만듭니다.",
    checks: [
      "목표 열·식별자·누수 후보 열 분리",
      "수치형·범주형 열에 서로 다른 전처리 적용",
      "ROC-AUC는 확률, F1은 라벨, RMSE는 연속 예측값 사용",
      "random_state와 검증 분할을 고정해 재현",
    ],
  },
  type3: {
    eyebrow: "유형 3",
    title: "질문을 가설로 번역한 뒤 검정을 선택합니다.",
    description:
      "평균, 비율, 독립성, 회귀계수 중 무엇을 묻는지 확인하고 표본 관계와 변수 유형에 맞춰 통계량과 p값을 계산합니다.",
    checks: [
      "독립표본과 대응표본 구분",
      "연속형·범주형 변수 조합 확인",
      "단측·양측 가설과 유의수준 고정",
      "통계적 유의성과 실무적 의미를 분리해 해석",
    ],
  },
  submission: {
    eyebrow: "제출 검수",
    title: "저장한 결과 파일을 다시 읽는 단계까지가 풀이입니다.",
    description:
      "예측 자체뿐 아니라 행 순서, 열 이름, 확률·라벨 구분, index 열, 결측 여부를 검사해야 제출 실수를 막을 수 있습니다.",
    checks: [
      "원본 id와 test 행 순서 보존",
      "전처리기는 train에만 fit",
      "문항이 요구한 라벨 또는 확률로 저장",
      "CSV는 지시된 예측 열 1개만 두고 index 제외",
    ],
  },
  "course-library": {
    eyebrow: "원본 자료 분류",
    title: "다운로드 자료를 직접 대비와 시험 밖 보충으로 분리했습니다.",
    description:
      "Python·pandas·통계·머신러닝 중 유형 풀이에 직접 쓰이는 자료만 본 커리큘럼에 연결했습니다. SQL·딥러닝·생성형 AI·프로젝트는 보충으로 분리했습니다.",
    checks: [
      "모든 파일에 SHA-256과 안정 ID 부여",
      "노트북 셀 수와 CSV 스키마를 메타데이터로 추출",
      "중복·대용량·권리·개인정보·누수 플래그 표시",
      "공개 다운로드 없이 로컬 외부 원본과 분리",
    ],
  },
};

type Props = {
  activeTab: BdaPracticalTab;
  library: BdaCourseLibrary;
  practicalTaskCount: number;
  conceptNames: Record<string, string>;
};

export function BdaPracticalHub({
  activeTab,
  library,
  practicalTaskCount,
  conceptNames,
}: Props) {
  const activeIntroduction = tabIntroductions[activeTab];
  const modules = bdaCourseCurriculum.filter(
    (module) => module.tab === activeTab,
  );
  const notebookCount = library.stats.byRole.notebook ?? 0;

  return (
    <main className="page-wrap pb-16 pt-8 sm:pt-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(18,38,58,.07)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)] lg:items-end">
          <div>
            <p className="eyebrow">빅데이터 분석 실무</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight text-[#142f4b] sm:text-4xl">
              유형 1·2·3을 분리한 실기 코딩 교재
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              공식 체험환경의 풀이·제출 방식을 기준으로 58개 과제와{" "}
              {bdaCodeLabs.length}개 코드 레슨을 연결했습니다. 539개 원본 자료는
              시험 직접성 검토를 거쳐 메타데이터로만 참조합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HeaderStat value={practicalTaskCount} label="실기 과제" icon={Code2} />
            <HeaderStat value={bdaCodeLabs.length} label="코드 레슨" icon={FileCode2} />
            <HeaderStat value={notebookCount} label="Jupyter 노트북" icon={Braces} />
            <HeaderStat value={library.stats.byRelevance.core} label="직접 대비 자료" icon={Table2} />
          </div>
        </div>
      </header>

      <aside className="mt-5 grid gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-blue-950 lg:grid-cols-[1fr_auto] lg:items-center">
        <p>
          <strong>공식 범위:</strong>{" "}
          {bdaExamBlueprint.practical.method},{" "}
          {bdaExamBlueprint.practical.durationMinutes}분입니다. 유형 1·2·3은
          체험환경 가이드의 학습 구조이며 실제 회차의 세부 문제·패키지는 달라질
          수 있습니다.
        </p>
        <Link
          href="/bda/practical/bank"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 font-black text-blue-900"
        >
          실기 과제 58개 보기 <ArrowRight size={16} />
        </Link>
      </aside>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <BdaPracticalTabs activeTab={activeTab} />

        <section
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="p-5 sm:p-7 lg:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,.9fr)] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#0f766e]">
                {activeIntroduction.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-[#142f4b] sm:text-3xl">
                {activeIntroduction.title}
              </h2>
              <p className="mt-4 max-w-3xl leading-8 text-slate-600">
                {activeIntroduction.description}
              </p>
            </div>
            <ul className="grid gap-2 rounded-2xl bg-[#edf8f5] p-4">
              {activeIntroduction.checks.map((check) => (
                <li
                  key={check}
                  className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-700"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[#0f766e]"
                    size={17}
                    aria-hidden="true"
                  />
                  {check}
                </li>
              ))}
            </ul>
          </div>

          {activeTab === "overview" ? (
            <ExamFlow />
          ) : null}

          <div className="mt-8 space-y-6">
            {modules.map((module) => (
              <CourseModuleSection
                key={module.id}
                module={module}
                libraryItems={library.items}
                conceptNames={conceptNames}
              />
            ))}
          </div>

          {activeTab === "course-library" ? (
            <div className="mt-9 border-t border-slate-200 pt-8">
              <BdaCourseLibraryBrowser
                items={library.items.map(toPublicResource)}
              />
            </div>
          ) : null}
        </section>
      </section>

      <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <LockKeyhole className="mt-1 shrink-0" size={18} aria-hidden="true" />
        <p>
          <strong>자료 사용 경계:</strong> 외부 교육자료는 로컬 학습용
          메타데이터로만 연결했습니다. 데이터셋은 개인정보·누수 검토 전 실행
          자산으로 승격하지 않으며, 강의 PDF·슬라이드는 권리 검토 전 공개하지
          않습니다.
        </p>
      </aside>
    </main>
  );
}

function HeaderStat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: typeof Code2;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-[#0f766e]" size={19} aria-hidden="true" />
      <strong className="mt-4 block text-2xl font-black text-[#142f4b]">
        {value.toLocaleString("ko-KR")}
      </strong>
      <span className="mt-1 block text-xs font-bold text-slate-500">{label}</span>
    </div>
  );
}

function ExamFlow() {
  const steps = [
    { label: "조건 읽기", text: "입력·목표·출력" },
    { label: "구조 확인", text: "shape·열·결측" },
    { label: "분석 실행", text: "처리·모델·검정" },
    { label: "중간 검증", text: "지표·통계량·행 수" },
    { label: "제출 감사", text: "파일 재로딩" },
  ];
  return (
    <section className="mt-8 rounded-2xl bg-[#153a59] p-5 text-white sm:p-6">
      <div className="flex items-center gap-3">
        <SearchCheck className="text-teal-200" aria-hidden="true" />
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-teal-200">
            Common workflow
          </p>
          <h3 className="mt-1 text-lg font-black">모든 유형의 공통 풀이 순서</h3>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="relative rounded-xl border border-white/15 bg-white/8 p-4"
          >
            <span className="text-xs font-black text-teal-200">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong className="mt-2 block text-sm">{step.label}</strong>
            <span className="mt-1 block text-xs leading-5 text-slate-300">
              {step.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CourseModuleSection({
  module,
  libraryItems,
  conceptNames,
}: {
  module: BdaCourseModule;
  libraryItems: BdaCourseLibraryItem[];
  conceptNames: Record<string, string>;
}) {
  const labs = module.codeLabIds
    .map((labId) => bdaCodeLabs.find((lab) => lab.id === labId))
    .filter((lab): lab is (typeof bdaCodeLabs)[number] => Boolean(lab));
  const resources = selectCourseResources(module, libraryItems, 6);
  const scopeLabel =
    module.examScope === "core"
      ? "시험 핵심"
      : module.examScope === "supporting"
        ? "보조 역량"
        : "확장 학습";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#153a59] px-3 py-1 text-white">
            {module.label}
          </span>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">
            {scopeLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            약 {module.estimatedMinutes}분
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-black text-[#142f4b]">{module.title}</h3>
        <p className="mt-3 max-w-4xl leading-7 text-slate-600">{module.summary}</p>
      </header>

      <div className="grid gap-0 lg:grid-cols-2">
        <section className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#0f766e]" size={19} aria-hidden="true" />
            <h4 className="font-black text-[#142f4b]">시험에서 판단할 기준</h4>
          </div>
          <ul className="mt-4 grid gap-2">
            {module.examDecisions.map((decision) => (
              <li
                key={decision}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0f766e]" />
                {decision}
              </li>
            ))}
          </ul>
        </section>

        <section className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Layers3 className="text-blue-700" size={19} aria-hidden="true" />
            <h4 className="font-black text-[#142f4b]">실행 순서</h4>
          </div>
          <ol className="mt-4 grid gap-2">
            {module.workflow.map((step, index) => (
              <li key={step.label} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm leading-6 text-slate-700">
                  <strong className="text-[#142f4b]">{step.label}</strong>
                  <span className="block text-slate-600">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[.8fr_1fr_1.2fr]">
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-[#142f4b]">
              <BookOpenText size={17} className="text-[#0f766e]" /> 연결 개념
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {module.conceptIds.map((conceptId) => (
                <Link
                  key={conceptId}
                  href={`/bda/concepts/${conceptId}`}
                  className="rounded-lg border border-teal-200 bg-white px-2.5 py-2 text-xs font-black text-teal-800 hover:bg-teal-50"
                >
                  {conceptId} {conceptNames[conceptId] ?? ""}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-[#142f4b]">
              <FileCode2 size={17} className="text-blue-700" /> 검증 코드 레슨
            </h4>
            <div className="mt-3 grid gap-2">
              {labs.length > 0 ? (
                labs.map((lab) => (
                  <Link
                    key={lab.id}
                    href={`/bda/practical/${lab.id}`}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300"
                  >
                    <span>{lab.title}</span>
                    <ArrowRight
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5"
                      size={16}
                    />
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm leading-6 text-slate-500">
                  이 영역은 시험 밖 보충자료 분류용이며 필수 코드 레슨은 없습니다.
                </p>
              )}
            </div>
          </section>

          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-[#142f4b]">
              <Database size={17} className="text-amber-700" /> 연결 원본 자료
            </h4>
            {resources.length > 0 ? (
              <ul className="mt-3 grid gap-2">
                {resources.map((resource) => (
                  <li
                    key={resource.id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <p className="line-clamp-1 text-sm font-bold text-slate-700">
                      {resource.title}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      {resource.role} · {resource.extension} ·{" "}
                      {formatBytes(resource.bytes)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                해당 분류의 원본 메타데이터를 확인 중입니다.
              </p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}

function toPublicResource(
  item: BdaCourseLibraryItem,
): PublicBdaCourseResource {
  const {
    id,
    relativePath,
    fileName,
    title,
    extension,
    bytes,
    sourceGroup,
    week,
    domain,
    role,
    practicalTrack,
    examRelevance,
    handling,
    reviewFlags,
    duplicateOf,
    firstMeaningfulLine,
    notebook,
    csv,
  } = item;
  return {
    id,
    relativePath,
    fileName,
    title,
    extension,
    bytes,
    sourceGroup,
    week,
    domain,
    role,
    practicalTrack,
    examRelevance,
    handling,
    reviewFlags,
    duplicateOf,
    firstMeaningfulLine,
    notebook,
    csv,
  };
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

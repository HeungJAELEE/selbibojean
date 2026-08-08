import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Target,
  XCircle,
} from "lucide-react";
import {
  WEAK_ACCURACY_THRESHOLD,
  type AccountLearningSummary,
  type LearningBreakdown,
} from "@/lib/learning/account-learning-summary";

export function AccountLearningDashboard({
  summary,
  unavailable = false,
}: {
  summary: AccountLearningSummary;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <section className="card p-7" aria-labelledby="learning-summary-title">
        <h2 id="learning-summary-title" className="text-xl font-extrabold">
          모의고사 학습 분석
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          학습 기록을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
        </p>
      </section>
    );
  }

  if (summary.attempts === 0) {
    return (
      <section className="card p-7" aria-labelledby="learning-summary-title">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">
            <ClipboardCheck aria-hidden />
          </span>
          <div>
            <h2 id="learning-summary-title" className="text-xl font-extrabold">
              모의고사 학습 분석
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              로그인한 상태로 필기 모의고사를 풀면 과목별 정답률과 취약
              중주제·소주제·핵심 키워드를 이곳에서 분석합니다.
            </p>
          </div>
        </div>
        <Link
          href="/written/mock"
          className="mt-6 inline-flex rounded-xl bg-[#173957] px-5 py-3 font-extrabold text-white"
        >
          첫 모의고사 시작
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6" aria-labelledby="learning-summary-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Personal learning analytics</p>
          <h2 id="learning-summary-title" className="mt-1 text-2xl font-extrabold">
            내 모의고사 학습 분석
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            최근 계정 모의고사와 직접 병합한 기기 기록의 최초 답안을
            기준으로 강점과 보강할 영역을 정리했습니다. 정답률{" "}
            {WEAK_ACCURACY_THRESHOLD}% 미만인 중주제와 소주제만 취약
            영역으로 표시합니다.
          </p>
        </div>
        <Link
          href="/progress"
          className="font-bold text-[#16697a] underline underline-offset-4"
        >
          전체 학습 분석 보기
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={<ClipboardCheck aria-hidden />}
          value={summary.mockSessions}
          label="응시한 모의고사"
        />
        <Metric
          icon={<Target aria-hidden />}
          value={summary.attempts}
          label="분석한 최초 답안"
        />
        <Metric
          icon={<CheckCircle2 aria-hidden />}
          value={summary.accuracy === null ? "-" : `${summary.accuracy}%`}
          label="전체 정답률"
        />
        <Metric
          icon={<XCircle aria-hidden />}
          value={summary.wrong}
          label="보강할 오답"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="card p-6">
          <h3 className="text-lg font-extrabold">과목별 성취도</h3>
          <div className="mt-5 grid gap-4">
            {summary.subjects.map((subject) => (
              <div key={subject.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <strong>{subject.title}</strong>
                  <span className="text-slate-500">
                    {subject.correct}/{subject.attempts} · {subject.accuracy}%
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`${subject.title} 정답률`}
                  aria-valuenow={subject.accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[#16697a]"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h3 className="text-lg font-extrabold">취약 중주제</h3>
          <p className="mt-2 text-sm text-slate-500">
            2회 이상 시도하고 정답률이 {WEAK_ACCURACY_THRESHOLD}% 미만인
            영역입니다.
          </p>
          {summary.weakGroups.length ? (
            <div className="mt-5 grid gap-3">
              {summary.weakGroups.map((group) => (
                <BreakdownRow key={group.id} item={group} />
              ))}
            </div>
          ) : (
            <InsufficientData />
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-6">
          <h3 className="text-lg font-extrabold">취약 소주제</h3>
          <p className="mt-2 text-sm text-slate-500">
            취약 소주제에서 바로 관련 개념을 다시 학습할 수 있습니다.
          </p>
          {summary.weakConcepts.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {summary.weakConcepts.map((concept) => (
                <BreakdownRow key={concept.id} item={concept} compact />
              ))}
            </div>
          ) : (
            <InsufficientData />
          )}
        </section>

        <section className="card border-[#6fb5b1] bg-[#f2fbfa] p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-white text-[#16697a]">
            <BookOpenCheck aria-hidden />
          </span>
          <h3 className="mt-5 text-lg font-extrabold">강화 학습 추천</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            취약영역 집중 모드는 최근 오답이 많이 쌓인 상위 3개 중주제의
            관련 문제를 우선 출제합니다.
          </p>
          {summary.focusKeywords.length ? (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="보강 키워드">
              {summary.focusKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#135c69]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            <Link
              href="/written/practice/random?mode=weak"
              className="rounded-xl bg-[#173957] px-5 py-3 text-center font-extrabold text-white"
            >
              취약영역 집중 모의고사
            </Link>
            <Link
              href="/written/review?mode=wrong"
              className="rounded-xl border border-[#16697a] bg-white px-5 py-3 text-center font-bold text-[#135c69]"
            >
              오답만 다시 풀기
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="card p-5">
      <span className="text-[#16697a]">{icon}</span>
      <p className="mt-4 text-2xl font-black">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function BreakdownRow({
  item,
  compact = false,
}: {
  item: LearningBreakdown;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">{item.subjectTitle}</p>
        </div>
        <strong className="shrink-0 text-rose-700">{item.accuracy}%</strong>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {item.correct}문제 정답 / {item.attempts}문제 시도
      </p>
      {!compact && item.keywords.length ? (
        <p className="mt-2 text-xs leading-5 text-slate-600">
          키워드: {item.keywords.slice(0, 4).join(" · ")}
        </p>
      ) : null}
      {item.href ? (
        <Link
          href={item.href}
          className="mt-3 inline-flex text-sm font-extrabold text-[#16697a] underline underline-offset-4"
        >
          개념 학습하기
        </Link>
      ) : null}
    </div>
  );
}

function InsufficientData() {
  return (
    <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      같은 분류의 문제를 두 번 이상 풀면 정답률을 비교합니다. 현재
      정답률 {WEAK_ACCURACY_THRESHOLD}% 미만인 취약 영역은 없습니다.
    </p>
  );
}

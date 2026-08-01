import { AccountLearningDashboard } from "@/components/account-learning-dashboard";
import { DeleteAccount } from "@/components/delete-account";
import { DeviceLearningStorage } from "@/components/device-learning-storage";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import { getLessonFamilyHref } from "@/lib/content/lesson-families";
import { getLessonSubcategories } from "@/lib/content/lesson-subcategories";
import {
  buildAccountLearningSummary,
  type AccountLearningAttempt,
} from "@/lib/learning/account-learning-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountActivity = {
  last_activity_at: string;
  purge_after: string;
  account_status: string;
};

type AttemptRow = {
  session_id: string | null;
  is_correct: boolean;
  attempted_at: string;
  questions:
    | { external_id: string }
    | Array<{ external_id: string }>
    | null;
};

export default async function AccountSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const content = await getContent();
  let activity: AccountActivity | null = null;
  let learningUnavailable = false;
  let attempts: AccountLearningAttempt[] = [];

  if (auth.user && supabase) {
    const [{ data: activityRow }, { data: sessions, error: sessionError }] =
      await Promise.all([
        supabase
          .from("account_activity")
          .select("last_activity_at,purge_after,account_status")
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("practice_sessions")
          .select("id,filter")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
    activity = activityRow;

    const mockSessionIds = (sessions ?? [])
      .filter((session) => {
        const filter = session.filter;
        return (
          typeof filter === "object" &&
          filter !== null &&
          !Array.isArray(filter) &&
          (filter as Record<string, unknown>).mode === "mock"
        );
      })
      .map((session) => String(session.id));

    if (sessionError) {
      learningUnavailable = true;
    } else {
      let attemptQuery = supabase
        .from("attempts")
        .select(
          "session_id,is_correct,attempted_at,questions!inner(external_id)",
        )
        .eq("user_id", auth.user.id)
        .eq("attempt_kind", "initial")
        .order("attempted_at", { ascending: false })
        .limit(500);
      attemptQuery = mockSessionIds.length
        ? attemptQuery.or(
            `session_id.in.(${mockSessionIds.join(",")}),session_id.is.null`,
          )
        : attemptQuery.is("session_id", null);
      const { data: attemptRows, error: attemptError } = await attemptQuery;

      learningUnavailable = Boolean(attemptError);
      attempts = ((attemptRows ?? []) as AttemptRow[]).flatMap((attempt) => {
        const relatedQuestion = Array.isArray(attempt.questions)
          ? attempt.questions[0]
          : attempt.questions;
        return relatedQuestion?.external_id
          ? [
              {
                questionId: relatedQuestion.external_id,
                sessionId: attempt.session_id,
                isCorrect: attempt.is_correct,
                attemptedAt: attempt.attempted_at,
              },
            ]
          : [];
      });
    }
  }

  const subjectById = new Map(
    content.subjects.map((subject) => [subject.id, subject.title]),
  );
  const groupById = new Map(
    content.conceptGroups.map((group) => [group.id, group]),
  );
  const lessonById = new Map(
    content.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const firstFamilyByGroupId = new Map(
    content.conceptGroups.map((group) => {
      const family = getLessonSubcategories(
        group.id,
        content.lessons.filter(
          (lesson) => lesson.conceptGroupId === group.id,
        ),
      )[0];
      return [group.id, family?.id] as const;
    }),
  );
  const questionMeta = content.questions.map((question) => {
    const group = groupById.get(question.conceptGroupId);
    const lesson = lessonById.get(question.lessonId);
    return {
      questionId: question.id,
      subjectId: question.subjectId,
      subjectTitle:
        subjectById.get(question.subjectId) ?? question.subjectId,
      groupId: question.conceptGroupId,
      groupTitle: group?.title ?? question.conceptGroupId,
      conceptId: question.conceptId,
      conceptTitle: lesson?.title ?? question.conceptId,
      keywords: group?.keywords ?? [],
      groupHref: firstFamilyByGroupId.get(question.conceptGroupId)
        ? getLessonFamilyHref(
            question.conceptGroupId,
            firstFamilyByGroupId.get(question.conceptGroupId)!,
          )
        : `/written/theory/subject/${question.subjectId}#${question.conceptGroupId}`,
      conceptHref: lesson ? `/written/theory/${lesson.id}` : undefined,
    };
  });
  const summary = buildAccountLearningSummary(attempts, questionMeta);

  return (
    <div className="page-wrap pb-16">
      <PageHeading
        eyebrow="My learning account"
        title="내 학습 계정"
        description="모의고사 결과에서 강점과 취약 영역을 찾고, 필요한 복습과 맞춤 문제로 바로 이어갑니다."
      />

      <div className="mb-6">
        <DeviceLearningStorage authenticated={Boolean(auth.user)} />
      </div>

      {auth.user ? (
        <AccountLearningDashboard
          summary={summary}
          unavailable={learningUnavailable}
        />
      ) : (
        <section className="card p-7">
          <h2 className="text-xl font-extrabold">로그인이 필요합니다</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            로그인하면 모의고사 기록을 계정별로 분석할 수 있습니다.
          </p>
        </section>
      )}

      <section className="card mt-8 max-w-2xl p-7">
        {activity ? (
          <>
            <h2 className="text-xl font-extrabold">계정 보관 기간</h2>
            <p className="mt-3 text-slate-600">
              마지막 활동:{" "}
              {new Date(activity.last_activity_at).toLocaleString("ko-KR")}
            </p>
            <p className="mt-1 font-bold text-[#16697a]">
              자동 삭제 예정:{" "}
              {new Date(activity.purge_after).toLocaleString("ko-KR")}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              로그인 또는 문제 제출 같은 인증 활동이 있으면 최대 한 시간에
              한 번 7일 기한이 연장됩니다.
            </p>
            <DeleteAccount />
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold">게스트 상태입니다</h2>
            <p className="mt-3 text-slate-600">
              로그인하면 학습 분석과 계정 보관 기간을 확인할 수 있습니다.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { DeviceLearningStorage } from "@/components/device-learning-storage";
import { GuestProgress } from "@/components/guest-progress";
import { PageHeading } from "@/components/page-heading";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Learning analytics"
        title="학습현황"
        description="비로그인 시 현재 기기 기록을, 로그인 시 계정에 병합된 모의고사 학습 분석을 확인합니다."
      />
      <DeviceLearningStorage authenticated={Boolean(auth.user)} />
      {auth.user ? (
        <div className="card mt-6 p-7">
          <h2 className="text-xl font-extrabold">계정 학습 분석</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            로그인 계정의 모의고사 결과와 정답률 70% 미만 중·소주제는 내
            학습 계정에서 확인할 수 있습니다.
          </p>
          <Link
            href="/settings/account"
            className="mt-5 inline-block rounded-xl bg-[#173957] px-5 py-3 font-bold text-white"
          >
            내 취약 영역 보기
          </Link>
        </div>
      ) : (
        <GuestProgress />
      )}
      <div className="card mt-6 p-7">
        <h2 className="text-xl font-extrabold">계정 학습 기록</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          상세 취약 중주제·소주제와 개념 학습 추천은 로그인한 계정에서만
          표시합니다. 비로그인 기록은 현재 브라우저에만 남습니다.
        </p>
        <Link
          href={auth.user ? "/settings/account" : "/login"}
          className="mt-5 inline-block rounded-xl bg-[#173957] px-5 py-3 font-bold text-white"
        >
          {auth.user ? "계정 학습 분석" : "로그인"}
        </Link>
      </div>
    </div>
  );
}

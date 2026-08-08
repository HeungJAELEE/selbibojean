import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";

export default function LoginPage() {
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Account"
        title="아이디로 로그인"
        description="아이디·비밀번호 또는 설정된 외부 계정으로 로그인합니다. 관리자 외 계정은 마지막 인증·학습 활동 후 7일이 지나면 사이트 계정과 학습 기록이 삭제됩니다."
      />
      <AccountForm
        mode="login"
        oauthProviders={{
          google: process.env.ENABLE_GOOGLE_OAUTH === "true",
          kakao: process.env.ENABLE_KAKAO_OAUTH === "true",
        }}
      />
    </div>
  );
}

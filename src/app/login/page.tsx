import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";
export default function LoginPage(){return <div className="page-wrap"><PageHeading eyebrow="Account" title="아이디로 로그인" description="이메일 없이 아이디와 비밀번호로 로그인합니다. 마지막 로그인 또는 인증된 학습 활동 후 7일이 지나면 계정이 자동 삭제됩니다."/><AccountForm mode="login"/></div>}

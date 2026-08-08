import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";
export default function RegisterPage(){return <div className="page-wrap"><PageHeading eyebrow="7-day account" title="간단 계정 만들기" description="마지막 로그인 또는 인증된 학습 활동 후 7일이 지나면 계정이 자동 삭제되고 아이디를 다시 사용할 수 있습니다. 중요한 비밀번호를 재사용하지 마세요."/><AccountForm mode="register"/></div>}

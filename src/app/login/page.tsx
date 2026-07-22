import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";
export default function LoginPage(){return <div className="page-wrap"><PageHeading eyebrow="Account" title="아이디로 로그인" description="이메일 없이 아이디와 비밀번호로 로그인합니다. 실패 메시지는 아이디 존재 여부와 관계없이 같습니다."/><AccountForm mode="login"/></div>}


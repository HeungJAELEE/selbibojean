import { AccountForm } from "@/components/account-form";
import { PageHeading } from "@/components/page-heading";
export default function RegisterPage(){return <div className="page-wrap"><PageHeading eyebrow="7-day account" title="간단 계정 만들기" description="아이디는 삭제 후 즉시 다시 사용할 수 있습니다. 비밀번호 복구는 제공하지 않으므로 중요한 비밀번호를 재사용하지 마세요."/><AccountForm mode="register"/></div>}


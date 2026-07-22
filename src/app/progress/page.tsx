import Link from "next/link";
import { GuestProgress } from "@/components/guest-progress";
import { PageHeading } from "@/components/page-heading";
export default function ProgressPage(){return <div className="page-wrap"><PageHeading eyebrow="Learning analytics" title="학습현황" description="로그인 전에는 이 브라우저의 기록을 보여줍니다. 가입하면 현재 게스트 기록을 새 계정으로 한 번 병합합니다."/><GuestProgress/><div className="card mt-6 p-7"><h2 className="text-xl font-extrabold">기록을 서버에 이어서 저장하려면</h2><p className="mt-3 text-sm leading-6 text-slate-600">일반 계정은 이메일이 필요 없지만 168시간 동안 인증된 학습 활동이 없으면 자동 삭제됩니다.</p><Link href="/register" className="mt-5 inline-block rounded-xl bg-[#173957] px-5 py-3 font-bold text-white">간단 계정 만들기</Link></div></div>}


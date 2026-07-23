import Link from "next/link";
import { ArrowRight, ListChecks, Shuffle, Target } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { getContent } from "@/lib/content/repository";
import { isPublishableQuestion } from "@/lib/domain/practice";

export default async function PracticePage() { const content=await getContent(); const count=content.questions.filter(isPublishableQuestion).length; return <div className="page-wrap"><PageHeading eyebrow="Written practice" title="필기 문제풀이" description={`정답·해설·선택지별 설명·이론 연결이 모두 검증된 ${count}개 문제만 공개합니다.`}/><div className="grid gap-5 md:grid-cols-3"><Mode href="/written/practice/random" icon={<Shuffle/>} title="랜덤 문제" text="범위와 문제 수를 고르고, 세션 안에서 중복 없이 풉니다."/><Mode href="/written/practice/random?mode=wrong" icon={<Target/>} title="내 오답" text="게스트 브라우저 또는 로그인 계정에 저장된 오답만 다시 풉니다."/><Mode href="/written/review" icon={<ListChecks/>} title="복습 예정" text="복습 정책에 따라 지금 풀 차례인 문제를 확인합니다."/></div></div>; }
function Mode({href,icon,title,text}:{href:string;icon:React.ReactNode;title:string;text:string}) { return <Link href={href} className="card group p-7"><span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]">{icon}</span><h2 className="mt-6 text-xl font-extrabold">{title}</h2><p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{text}</p><span className="mt-5 flex items-center gap-2 text-sm font-extrabold text-[#16697a]">시작하기<ArrowRight size={16}/></span></Link>; }

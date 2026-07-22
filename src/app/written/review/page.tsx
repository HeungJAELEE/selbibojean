import Link from "next/link";
import { Clock3 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
export default function ReviewPage(){return <div className="page-wrap"><PageHeading eyebrow="Spaced review" title="오늘의 복습" description="오답은 10분 후, 정답+모름은 1일, 헷갈림은 3일, 앎은 7일 후 다시 만납니다."/><div className="card grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10"><div><span className="grid size-12 place-items-center rounded-xl bg-[#eaf7f6] text-[#16697a]"><Clock3/></span><h2 className="mt-6 text-2xl font-extrabold">지금 복습할 문제를 불러오세요</h2><p className="mt-3 max-w-2xl text-slate-600">게스트 기록은 현재 브라우저에서, 로그인 기록은 서버의 복습 큐에서 조회합니다. 연속 2회 정답+앎은 14일, 3회 이상은 30일로 늘어납니다.</p></div><Link href="/written/practice/random?mode=due" className="rounded-xl bg-[#173957] px-6 py-4 text-center font-extrabold text-white">복습 문제 시작</Link></div></div>}


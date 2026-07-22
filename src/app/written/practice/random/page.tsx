import { Suspense } from "react";
import { PageHeading } from "@/components/page-heading";
import { RandomPractice } from "@/components/random-practice";
import { getContent } from "@/lib/content/repository";

export default async function RandomPracticePage() { const content=await getContent(); return <div className="page-wrap"><PageHeading eyebrow="No duplicate session" title="랜덤 문제풀이" description="정답은 제출 전 응답에 포함되지 않습니다. 범위 결과가 요청 수보다 적으면 가능한 문제를 한 번씩만 출제합니다."/><Suspense fallback={<div className="card p-8">문제 설정을 불러오는 중…</div>}><RandomPractice subjects={content.subjects} groups={content.conceptGroups}/></Suspense></div>; }


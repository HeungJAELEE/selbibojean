import Link from "next/link";
import { ArrowLeft, Construction, FileText, Wrench } from "lucide-react";
import { PageHeading } from "@/components/page-heading";

export default function PracticalMockPage() {
  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Practical mock exam"
        title="실기 모의고사"
        description="실기 문제 데이터와 채점 기준을 검수한 뒤 10문제형 모의고사로 제공할 예정입니다. 현재는 확장 구조만 준비되어 있습니다."
      />
      <section className="card overflow-hidden">
        <div className="grid gap-6 bg-[#173957] p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div><p className="text-xs font-black uppercase tracking-[.14em] text-[#8dd5ce]">Coming next</p><h2 className="mt-2 text-2xl font-extrabold">10문제형 실기 모의고사</h2><p className="mt-3 max-w-2xl leading-7 text-slate-200">필답형·작업형 문제, 모범답안, 부분점수 루브릭과 안전 체크리스트를 검수한 뒤 활성화합니다. 검증되지 않은 실기 문제는 임의로 출제하지 않습니다.</p></div>
          <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-[#8dd5ce]"><Construction size={30} /></span>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
          <Link href="/practical/written" className="rounded-2xl border border-slate-200 p-5"><FileText className="text-[#16697a]" /><strong className="mt-4 block">필답형 구조 보기</strong><span className="mt-2 block text-sm text-slate-500">서술형 문제와 채점 루브릭 확장 구조</span></Link>
          <Link href="/practical/work" className="rounded-2xl border border-slate-200 p-5"><Wrench className="text-[#16697a]" /><strong className="mt-4 block">작업형 구조 보기</strong><span className="mt-2 block text-sm text-slate-500">공유압·유압·용접 작업 및 안전 체크 구조</span></Link>
        </div>
      </section>
      <Link href="/" className="mb-16 mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={16} /> 홈으로 돌아가기</Link>
    </div>
  );
}

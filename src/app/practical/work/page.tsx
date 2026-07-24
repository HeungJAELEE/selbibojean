import { PageHeading } from "@/components/page-heading";

export default function PracticalWorkPage() {
  return (
    <div className="page-wrap py-12">
      <PageHeading
        eyebrow="Practical · work"
        title="실기 작업형"
        description="필답형과 분리해 공기압·유압·보수용접 실제 수행과제와 안전·실격조건을 관리합니다."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["공기압 시스템", "회로 구성·작동 확인·고장진단"],
          ["유압 시스템", "회로 구성·압력 설정·잔류에너지 안전"],
          ["보수용접 및 누수시험", "작업순서·검사·보호구·실격조건"],
        ].map(([title, text]) => (
          <div key={title} className="card p-7">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            <p className="mt-5 text-xs font-extrabold text-amber-700">
              공식 공개과제 원문 검수 후 콘텐츠 공개
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
